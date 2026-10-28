param([string]$Page = 'graph.html', [switch]$ReducedMotion, [string]$Screenshot, [int]$Width=1440, [int]$Height=1100, [ValidateSet('basic','percentage','fraction','trig','coordinates','sequences','probability','complex','studio','graph','scientific','algebra-lab','geometry-lab','calculus','statistics','matrix','tools')][string]$Preview='graph', [switch]$DarkPreview, [switch]$LightPreview, [switch]$GraphDrag, [switch]$TimelineDrag, [ValidateSet('','rectangle','triangle','parallelogram','trapezoid','circle','cube','cuboid','cylinder','cone','sphere')][string]$GeometryShape='', [double]$GeometryPosition=3, [double]$LessonPosition=-1, [switch]$ExportDownloads, [switch]$ThreeD, [switch]$NetPreview, [switch]$SolidDrag, [switch]$Offline)
$ErrorActionPreference = 'Stop'
$browserPath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$profilePath = Join-Path ([IO.Path]::GetTempPath()) ('forma-browser-' + [guid]::NewGuid().ToString('N'))
$browserProcess = Start-Process -FilePath $browserPath -ArgumentList @('--headless', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--remote-debugging-port=0', "--user-data-dir=$profilePath", 'about:blank') -WindowStyle Hidden -PassThru
$socket = [Net.WebSockets.ClientWebSocket]::new()
$script:messageId = 0
$script:browserErrors = [Collections.Generic.List[string]]::new()
function Send-DevTools([string]$Method, $Parameters = @{}) {
    $script:messageId++
    $id = $script:messageId
    $json = @{id=$id;method=$Method;params=$Parameters} | ConvertTo-Json -Depth 20 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($json)
    $segment = [ArraySegment[byte]]::new($bytes)
    $socket.SendAsync($segment, [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
    do {
        $stream = [IO.MemoryStream]::new()
        do {
            $buffer = [byte[]]::new(65536)
            $received = $socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), [Threading.CancellationToken]::None).GetAwaiter().GetResult()
            $stream.Write($buffer, 0, $received.Count)
        } while (-not $received.EndOfMessage)
        $reply = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
        $stream.Dispose()
        if($reply.method -eq 'Runtime.exceptionThrown'){$script:browserErrors.Add(($reply.params.exceptionDetails | ConvertTo-Json -Depth 8 -Compress))}
        if($reply.method -eq 'Runtime.consoleAPICalled' -and $reply.params.type -eq 'error'){$script:browserErrors.Add(($reply.params.args | ConvertTo-Json -Depth 5 -Compress))}
        if($reply.method -eq 'Log.entryAdded' -and $reply.params.entry.level -eq 'error'){$script:browserErrors.Add($reply.params.entry.text)}
    } while ($reply.id -ne $id)
    if ($reply.error) { throw ($reply.error | ConvertTo-Json -Compress) }
    return $reply.result
}
try {
    $portFile = Join-Path $profilePath 'DevToolsActivePort'
    $deadline = [DateTime]::UtcNow.AddSeconds(15)
    while (-not (Test-Path -LiteralPath $portFile)) {
        if ([DateTime]::UtcNow -gt $deadline) { throw 'Browser did not open its debugging port.' }
        Start-Sleep -Milliseconds 100
    }
    $port = (Get-Content -LiteralPath $portFile)[0]
    $pages = Invoke-RestMethod -Uri "http://localhost:$port/json/list"
    $socket.ConnectAsync([uri]$pages[0].webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
    # Isolate the test from Edge's asynchronous startup-tab navigation.
    $target=Send-DevTools 'Target.createTarget' @{url='about:blank'}
    $socket.Dispose()
    $socket=[Net.WebSockets.ClientWebSocket]::new()
    $pages=Invoke-RestMethod -Uri "http://localhost:$port/json/list"
    $testPage=$pages | Where-Object {$_.id -eq $target.targetId} | Select-Object -First 1
    $socket.ConnectAsync([uri]$testPage.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
    Send-DevTools 'Emulation.setDeviceMetricsOverride' @{width=$Width;height=$Height;deviceScaleFactor=1;mobile=$false} | Out-Null
    if ($ReducedMotion) { Send-DevTools 'Emulation.setEmulatedMedia' @{features=@(@{name='prefers-reduced-motion';value='reduce'})} | Out-Null }
    if($Offline){Send-DevTools 'Network.enable' | Out-Null;Send-DevTools 'Network.emulateNetworkConditions' @{offline=$true;latency=0;downloadThroughput=0;uploadThroughput=0} | Out-Null}
    $testPath = Join-Path $PSScriptRoot $Page
    Send-DevTools 'Page.enable' | Out-Null
    Send-DevTools 'Runtime.enable' | Out-Null
    Send-DevTools 'Log.enable' | Out-Null
    Start-Sleep -Milliseconds 250
    for($attempt=0;$attempt -lt 4;$attempt++){
        Send-DevTools 'Page.stopLoading' | Out-Null
        $navigation=Send-DevTools 'Page.navigate' @{url=([uri]$testPath).AbsoluteUri}
        if($navigation.errorText -ne 'net::ERR_ABORTED'){break}
        Start-Sleep -Milliseconds 300
    }
    if($navigation.errorText){throw ('Navigation failed: '+$navigation.errorText)}
    $deadline = [DateTime]::UtcNow.AddSeconds(35)
    do {
        Start-Sleep -Milliseconds 200
        $answer = Send-DevTools 'Runtime.evaluate' @{expression="document.getElementById('report')?.textContent || 'LOADING'";returnByValue=$true}
        $report = $answer.result.value
        if ([DateTime]::UtcNow -gt $deadline) { $details=Send-DevTools 'Runtime.evaluate' @{expression="location.href + ' ' + document.body?.innerText?.slice(0,1000)";returnByValue=$true};throw "Browser test timed out: $report $($details.result.value)" }
    } while ($report -notmatch '^(PASS|FAIL)')
    Write-Output $report
    if($script:browserErrors.Count -gt 0){throw ('Browser console/runtime errors: '+($script:browserErrors -join "`n"))}
    Write-Output 'Console/runtime errors: 0'
    if($ExportDownloads -and $report -notmatch '^FAIL'){
        $exportRoot=Join-Path $PSScriptRoot 'exports'
        $downloadDirectory=Join-Path $exportRoot ([guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $downloadDirectory -Force | Out-Null
        Send-DevTools 'Browser.setDownloadBehavior' @{behavior='allow';downloadPath=$downloadDirectory} | Out-Null
        Send-DevTools 'Runtime.evaluate' @{expression="var ef=document.querySelector('iframe').contentWindow;if(ef.document.documentElement.lang!=='en')ef.document.getElementById('language-toggle').click();ef.FormaWorkspace.applyExample('graph',1);ef.document.getElementById('graph-pin').click();ef.FormaGraph.setCoefficients([1,0,-2],{instant:true});ef.document.getElementById('graph-export-svg').click();ef.document.getElementById('graph-export-png').click();"} | Out-Null
        $svgFile=Join-Path $downloadDirectory 'forma-graph.svg'
        $pngFile=Join-Path $downloadDirectory 'forma-graph.png'
        $exportDeadline=[DateTime]::UtcNow.AddSeconds(10)
        while(-not ((Test-Path -LiteralPath $svgFile) -and (Test-Path -LiteralPath $pngFile))){if([DateTime]::UtcNow -gt $exportDeadline){throw 'SVG/PNG button downloads did not complete.'};Start-Sleep -Milliseconds 100}
        $svgText=[IO.File]::ReadAllText($svgFile)
        $pngBytes=[IO.File]::ReadAllBytes($pngFile)
        if(-not $svgText.Contains('graph-axes') -or -not $svgText.Contains('Pinned Before')){throw 'Downloaded SVG lost axes or legend.'}
        if($pngBytes.Length -lt 1000 -or $pngBytes[0] -ne 137 -or $pngBytes[1] -ne 80){throw 'Downloaded PNG signature is invalid.'}
        [IO.File]::WriteAllText((Join-Path $exportRoot 'forma-graph.svg'),$svgText,[Text.UTF8Encoding]::new($false))
        [IO.File]::WriteAllBytes((Join-Path $exportRoot 'forma-graph.png'),$pngBytes)
        Write-Output 'PASS 2 actual SVG/PNG button downloads; artifacts in tests/exports'
        if($script:browserErrors.Count -gt 0){throw 'Console/runtime errors during export download checks.'}
    }
    if($TimelineDrag -and $report -notmatch '^FAIL'){
        Send-DevTools 'Runtime.evaluate' @{expression="document.getElementById('report').style.display='none';document.body.style.margin='0';var tf=document.querySelector('iframe');tf.style.cssText='display:block;width:100vw;height:100vh;border:0';var tw=tf.contentWindow;tw.FormaApp.selectMode('fraction');tw.document.getElementById('lab-shared-scrub').scrollIntoView({block:'center'});"} | Out-Null
        Start-Sleep -Milliseconds 120
        $q=(Send-DevTools 'Runtime.evaluate' @{expression="JSON.stringify((()=>{const a=tw.document.getElementById('lab-shared-scrub').getBoundingClientRect(),b=tf.getBoundingClientRect();return {x:a.left+b.left,y:a.top+b.top+a.height/2,width:a.width};})())";returnByValue=$true}).result.value | ConvertFrom-Json
        Send-DevTools 'Input.dispatchMouseEvent' @{type='mousePressed';x=($q.x+.15*$q.width);y=$q.y;button='left';buttons=1;clickCount=1} | Out-Null
        Send-DevTools 'Input.dispatchMouseEvent' @{type='mouseMoved';x=($q.x+.75*$q.width);y=$q.y;button='left';buttons=1} | Out-Null
        Send-DevTools 'Input.dispatchMouseEvent' @{type='mouseReleased';x=($q.x+.75*$q.width);y=$q.y;button='left';buttons=0;clickCount=1} | Out-Null
        $mouse=(Send-DevTools 'Runtime.evaluate' @{expression="tw.FormaLabs.player.position>2.5&&!tw.FormaLabs.player.playing";returnByValue=$true}).result.value
        if(-not $mouse){throw 'Trusted timeline mouse drag failed.'}
        Send-DevTools 'Emulation.setTouchEmulationEnabled' @{enabled=$true;maxTouchPoints=1} | Out-Null
        Send-DevTools 'Input.dispatchTouchEvent' @{type='touchStart';touchPoints=@(@{x=($q.x+.25*$q.width);y=$q.y;id=1})} | Out-Null
        Send-DevTools 'Input.dispatchTouchEvent' @{type='touchMove';touchPoints=@(@{x=($q.x+.55*$q.width);y=$q.y;id=1})} | Out-Null
        Send-DevTools 'Input.dispatchTouchEvent' @{type='touchEnd';touchPoints=@()} | Out-Null
        $touch=(Send-DevTools 'Runtime.evaluate' @{expression="tw.FormaLabs.player.position>1.5&&tw.FormaLabs.player.position<2.6&&!tw.FormaLabs.player.playing";returnByValue=$true}).result.value
        if(-not $touch){throw 'Trusted timeline touch drag failed.'}
        Write-Output 'PASS 2 trusted mouse/touch timeline scrub checks'
    }
    if($GraphDrag -and $report -notmatch '^FAIL'){
        Send-DevTools 'Runtime.evaluate' @{expression="document.getElementById('report').style.display='none';document.body.style.margin='0';var frame=document.querySelector('iframe');frame.style.cssText='display:block;width:100vw;height:100vh;border:0';var w=frame.contentWindow;w.document.querySelector('[data-mode=graph]').click();w.FormaGraphTeaching.reset();w.document.getElementById('graph-family').value='quadratic';w.document.getElementById('graph-family').dispatchEvent(new w.Event('change'));w.FormaGraph.setCoefficients([1,0,0],{instant:true});w.document.getElementById('graph-vertex-handle').scrollIntoView({block:'center'});"} | Out-Null
        Start-Sleep -Milliseconds 150
        $getPoint="JSON.stringify((()=>{const h=w.document.getElementById('graph-vertex-handle').getBoundingClientRect(),r=frame.getBoundingClientRect();return {x:r.left+h.left+h.width/2,y:r.top+h.top+h.height/2};})())"
        $p=(Send-DevTools 'Runtime.evaluate' @{expression=$getPoint;returnByValue=$true}).result.value | ConvertFrom-Json
        Send-DevTools 'Input.dispatchMouseEvent' @{type='mousePressed';x=$p.x;y=$p.y;button='left';buttons=1;clickCount=1} | Out-Null
        Send-DevTools 'Input.dispatchMouseEvent' @{type='mouseMoved';x=($p.x+25);y=($p.y-10);button='left';buttons=1} | Out-Null
        Send-DevTools 'Input.dispatchMouseEvent' @{type='mouseReleased';x=($p.x+25);y=($p.y-10);button='left';buttons=0;clickCount=1} | Out-Null
        $mouse=(Send-DevTools 'Runtime.evaluate' @{expression="(()=>{const c=w.FormaGraph.snapshot().coeff,v=w.FormaMath.quadratic(...c).vertex;return c[0]===1&&v.x>0&&v.y>0;})()";returnByValue=$true}).result.value
        if(-not $mouse){throw 'Trusted mouse vertex drag failed.'}
        Send-DevTools 'Runtime.evaluate' @{expression="w.FormaGraph.setCoefficients([1,0,0],{instant:true});w.document.getElementById('graph-vertex-handle').scrollIntoView({block:'center'});"} | Out-Null
        $p=(Send-DevTools 'Runtime.evaluate' @{expression=$getPoint;returnByValue=$true}).result.value | ConvertFrom-Json
        Send-DevTools 'Emulation.setTouchEmulationEnabled' @{enabled=$true;maxTouchPoints=1} | Out-Null
        Send-DevTools 'Input.dispatchTouchEvent' @{type='touchStart';touchPoints=@(@{x=$p.x;y=$p.y;id=1})} | Out-Null
        Send-DevTools 'Input.dispatchTouchEvent' @{type='touchMove';touchPoints=@(@{x=($p.x-25);y=($p.y-10);id=1})} | Out-Null
        Send-DevTools 'Input.dispatchTouchEvent' @{type='touchEnd';touchPoints=@()} | Out-Null
        $touch=(Send-DevTools 'Runtime.evaluate' @{expression="(()=>{const c=w.FormaGraph.snapshot().coeff,v=w.FormaMath.quadratic(...c).vertex;return c[0]===1&&v.x<0&&v.y>0;})()";returnByValue=$true}).result.value
        if(-not $touch){throw 'Trusted touch vertex drag failed.'}
        Write-Output 'PASS 2 trusted DevTools mouse/touch drag checks'
        if($script:browserErrors.Count -gt 0){throw 'Console/runtime error during trusted drag checks.'}
    }
    if($SolidDrag -and $report -notmatch '^FAIL'){
        Send-DevTools 'Runtime.evaluate' @{expression="(async()=>{document.getElementById('report').style.display='none';document.body.style.margin='0';var sf=document.querySelector('iframe');sf.style.cssText='display:block;width:100vw;height:100vh;border:0';var sw=sf.contentWindow;sw.FormaApp.selectMode('geometry-lab');var shape=sw.document.getElementById('geo-shape');shape.value='cube';shape.dispatchEvent(new sw.Event('change',{bubbles:true}));await sw.FormaGeometry3D.setView('3d');sw.FormaLabs.player.seek(2);if(sw.document.getElementById('solid-interact').getAttribute('aria-pressed')!=='true')sw.document.getElementById('solid-interact').click();sw.document.getElementById('solid-viewport').scrollIntoView({block:'center'});window.sw=sw;window.sf=sf;window.solidBefore=sw.FormaGeometry3D.camera.position.clone();})()";awaitPromise=$true} | Out-Null
        Start-Sleep -Milliseconds 150
        $q=(Send-DevTools 'Runtime.evaluate' @{expression="JSON.stringify((()=>{const a=sw.FormaGeometry3D.renderer.domElement.getBoundingClientRect(),b=sf.getBoundingClientRect();return {x:a.left+b.left+a.width/2,y:a.top+b.top+a.height/2};})())";returnByValue=$true}).result.value | ConvertFrom-Json
        Send-DevTools 'Input.dispatchMouseEvent' @{type='mousePressed';x=$q.x;y=$q.y;button='left';buttons=1;clickCount=1} | Out-Null
        Send-DevTools 'Input.dispatchMouseEvent' @{type='mouseMoved';x=($q.x+35);y=($q.y+15);button='left';buttons=1} | Out-Null
        Send-DevTools 'Input.dispatchMouseEvent' @{type='mouseReleased';x=($q.x+35);y=($q.y+15);button='left';buttons=0;clickCount=1} | Out-Null
        $mouse=(Send-DevTools 'Runtime.evaluate' @{expression="sw.FormaGeometry3D.camera.position.distanceTo(solidBefore)>.01&&sw.FormaLabs.player.position===2";returnByValue=$true}).result.value
        if(-not $mouse){throw 'Trusted 3D mouse orbit failed.'}
        Send-DevTools 'Runtime.evaluate' @{expression="window.solidBefore=sw.FormaGeometry3D.camera.position.clone();window.solidScroll=sw.scrollY;"} | Out-Null
        Send-DevTools 'Emulation.setTouchEmulationEnabled' @{enabled=$true;maxTouchPoints=2} | Out-Null
        Send-DevTools 'Input.dispatchTouchEvent' @{type='touchStart';touchPoints=@(@{x=$q.x;y=$q.y;id=1})} | Out-Null
        Send-DevTools 'Input.dispatchTouchEvent' @{type='touchMove';touchPoints=@(@{x=($q.x-35);y=($q.y+20);id=1})} | Out-Null
        Send-DevTools 'Input.dispatchTouchEvent' @{type='touchEnd';touchPoints=@()} | Out-Null
        $touch=(Send-DevTools 'Runtime.evaluate' @{expression="sw.FormaGeometry3D.camera.position.distanceTo(solidBefore)>.01&&sw.scrollY===solidScroll&&sw.FormaLabs.player.position===2";returnByValue=$true}).result.value
        if(-not $touch){throw 'Trusted 3D touch orbit/scroll isolation failed.'}
        Write-Output 'PASS 2 trusted mouse/touch 3D orbit checks'
        if($script:browserErrors.Count -gt 0){throw 'Console/runtime error during 3D drag checks.'}
    }
    if ($Screenshot) {
        Send-DevTools 'Runtime.evaluate' @{expression="document.getElementById('report').style.display='none';document.body.style.margin='0';const iframe=document.querySelector('iframe');iframe.style.cssText='display:block;width:100vw;height:100vh;border:0';const doc=iframe.contentWindow.document;if('$Preview'==='studio'){iframe.contentWindow.FormaApp.selectMode('basic');iframe.contentWindow.FormaDimensional.collapse(false);doc.activeElement?.blur();}else doc.querySelector('[data-mode=$Preview]').click();if('$Preview'==='graph')doc.getElementById('graph-a').dispatchEvent(new iframe.contentWindow.Event('input'));else if(['basic','percentage'].includes('$Preview')){doc.getElementById('tool-example').click();}else if(!['scientific','studio'].includes('$Preview'))doc.getElementById('lab-calculate').click();iframe.contentWindow.scrollTo(0,0);"} | Out-Null
        if($LightPreview){Send-DevTools 'Runtime.evaluate' @{expression="if(iframe.contentWindow.document.documentElement.dataset.theme!=='light')iframe.contentWindow.document.getElementById('theme-toggle').click()"} | Out-Null}
        if($DarkPreview){Send-DevTools 'Runtime.evaluate' @{expression="if(iframe.contentWindow.document.documentElement.dataset.theme!=='dark')iframe.contentWindow.document.getElementById('theme-toggle').click()"} | Out-Null}
        if($GraphDrag){Send-DevTools 'Runtime.evaluate' @{expression="var g=iframe.contentWindow;g.FormaGraph.setCoefficients([1,0,0],{instant:true});g.document.getElementById('graph-pin').click();g.FormaGraph.setCoefficients([1,-2,-2],{instant:true,keepView:true});g.document.querySelector('.graph-canvas').scrollIntoView({block:'start'});"} | Out-Null}
        if($GeometryShape){Send-DevTools 'Runtime.evaluate' @{expression="var g=iframe.contentWindow;var select=g.document.getElementById('geo-shape');select.value='$GeometryShape';select.dispatchEvent(new g.Event('change',{bubbles:true}));g.FormaLabs.player.pause();g.FormaLabs.player.seek($GeometryPosition);g.document.querySelector('.lab-output').scrollIntoView({block:'start'});"} | Out-Null}
        if($Preview -eq 'fraction'){Send-DevTools 'Runtime.evaluate' @{expression="var g=iframe.contentWindow;g.FormaLabs.player.pause();g.FormaLabs.player.seek(2.5);g.document.querySelector('.lab-output').scrollIntoView({block:'start'});"} | Out-Null}
        if($Preview -eq 'trig'){Send-DevTools 'Runtime.evaluate' @{expression="var g=iframe.contentWindow;g.FormaLabs.player.pause();g.document.querySelector('.lab-output').scrollIntoView({block:'start'});"} | Out-Null}
        if($LessonPosition -ge 0){Send-DevTools 'Runtime.evaluate' @{expression="var g=iframe.contentWindow;g.FormaLabs.player.pause();g.FormaLabs.player.seek($LessonPosition);g.document.querySelector('.lab-output').scrollIntoView({block:'start'});"} | Out-Null}
        if($ThreeD){Send-DevTools 'Runtime.evaluate' @{expression="(async()=>{await iframe.contentWindow.FormaGeometry3D.setView('3d');iframe.contentWindow.document.getElementById('solid-material').value='solid';iframe.contentWindow.document.getElementById('solid-material').dispatchEvent(new iframe.contentWindow.Event('change'));iframe.contentWindow.document.getElementById('solid-projection').value='ortho';iframe.contentWindow.document.getElementById('solid-projection').dispatchEvent(new iframe.contentWindow.Event('change'));if('$NetPreview'==='True')iframe.contentWindow.FormaGeometry3D.setVariant('net');iframe.contentWindow.FormaLabs.player.seek($GeometryPosition);iframe.contentWindow.document.querySelector('.lab-output').scrollIntoView({block:'start'});})()";awaitPromise=$true} | Out-Null}
        Start-Sleep -Milliseconds 400
        $shot = Send-DevTools 'Page.captureScreenshot' @{format='png'}
        [IO.File]::WriteAllBytes($Screenshot, [Convert]::FromBase64String($shot.data))
    }
    if ($report -match '^FAIL') { throw 'Browser assertions failed.' }
} finally {
    if ($socket.State -eq [Net.WebSockets.WebSocketState]::Open) { Send-DevTools 'Browser.close' | Out-Null }
    $socket.Dispose()
}

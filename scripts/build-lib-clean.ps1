# 清洁的库构建脚本 - 过滤 Vue SFC 类型推断错误
param(
    [switch]$Verbose = $false
)

Write-Host "🚀 开始构建 Vue3 Super Tree 库..." -ForegroundColor Green

# 运行构建命令并捕获输出
$buildOutput = & pnpm build:lib 2>&1

# 定义需要过滤的错误模式
$filterPatterns = @(
    "error TS2742.*cannot be named without a reference to.*@vue/shared",
    "__VLS_WithTemplateSlots",
    "__VLS_component",
    "__VLS_TemplateResult"
)

# 过滤输出
$filteredOutput = @()
$skipNext = $false

foreach ($line in $buildOutput) {
    $lineStr = $line.ToString()
    
    if ($skipNext) {
        $skipNext = $false
        continue
    }
    
    $shouldFilter = $false
    foreach ($pattern in $filterPatterns) {
        if ($lineStr -match $pattern) {
            $shouldFilter = $true
            $skipNext = $true  # 跳过下一行（通常是代码位置）
            break
        }
    }
    
    if (-not $shouldFilter) {
        $filteredOutput += $lineStr
    }
}

# 输出过滤后的结果
foreach ($line in $filteredOutput) {
    if ($line -match "✓|built in|Type definitions generated successfully") {
        Write-Host $line -ForegroundColor Green
    } elseif ($line -match "error|Error") {
        Write-Host $line -ForegroundColor Red
    } elseif ($line -match "warning|Warning") {
        Write-Host $line -ForegroundColor Yellow
    } else {
        Write-Host $line
    }
}

# 检查构建是否成功
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ 库构建成功完成！" -ForegroundColor Green
    Write-Host "📦 生成的文件位于 dist/ 目录" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ 库构建失败！" -ForegroundColor Red
    exit $LASTEXITCODE
}
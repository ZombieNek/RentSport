var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Настройка для статических файлов
app.UseDefaultFiles();    // index.html будет открываться по умолчанию
app.UseStaticFiles();     // папка wwwroot будет отдаваться статически

// Если нужно — можно добавить обработчик для корня (на всякий случай)
app.MapGet("/api/hello", () => "API работает!");

app.Run();
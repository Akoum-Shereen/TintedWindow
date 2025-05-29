using Microsoft.AspNetCore.Mvc.Filters;

namespace TintedWindow.Filters
{
    public class GlobalLoggingExceptionFilter : IExceptionFilter
    {
        private ILogger<GlobalLoggingExceptionFilter> _logger;

        public GlobalLoggingExceptionFilter(ILogger<GlobalLoggingExceptionFilter> logger)
        {
            _logger = logger;
        }

        public void OnException(ExceptionContext context)
        {
            _logger.LogError(context.Exception.ToString());
        }
    }
}

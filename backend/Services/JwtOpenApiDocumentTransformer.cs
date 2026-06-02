using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;

public sealed class JwtOpenApiDocumentTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        // Basic info
        document.Info = new OpenApiInfo
        {
            Title = "My API",
            Version = "v1",
            Description = "API for my application"
        };

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, OpenApiSecurityScheme>();

        // JWT security scheme
        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "JWT Authorization header using the Bearer scheme."
        };

        // Apply security globally
        document.SecurityRequirements ??= new List<OpenApiSecurityRequirement>();
        document.SecurityRequirements.Add(new OpenApiSecurityRequirement
        {
            [document.Components.SecuritySchemes["Bearer"]] = Array.Empty<string>()
        });

        return Task.CompletedTask;
    }
}

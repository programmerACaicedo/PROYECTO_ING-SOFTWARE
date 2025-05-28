package com.apiweb.backend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Rutas REST
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000",
                                "https://fkzklx7z-3000.use2.devtunnels.ms")
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowCredentials(true);

        // Si sirves algún recurso estático bajo /ws, puedes permitirlo también:
        registry.addMapping("/ws/**")
                .allowedOrigins("http://localhost:3000",
                                "https://fkzklx7z-3000.use2.devtunnels.ms");
    System.out.println("CORS configurado para /api/**");
    }
}

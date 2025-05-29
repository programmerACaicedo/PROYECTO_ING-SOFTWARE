package com.apiweb.backend.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.client.RestTemplate;

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

    // Usa RestTemplate o WebClient para hacer POST a tu servidor Node.js
    public void sendMessageToNodeServer(Object chat) {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.postForObject("http://localhost:4000/api/socket/nuevoMensaje", chat, Void.class);
    }
}

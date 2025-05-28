package com.apiweb.backend.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(
        org.springframework.messaging.simp.config.MessageBrokerRegistry config
    ) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
          .addEndpoint("/ws")
          .setAllowedOrigins(
            "http://localhost:3000",        // tu React local
            "https://fkzklx7z-3000.use2.devtunnels.ms"  // tu túnel dev
          )
          .withSockJS();
    }
}

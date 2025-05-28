package com.apiweb.backend.Controller;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apiweb.backend.Exception.InvalidUserRoleException;
import com.apiweb.backend.Exception.ResourceNotFoundException;
import com.apiweb.backend.Exception.UserNotFoundException;
import com.apiweb.backend.Model.MensajeriaModel;
import com.apiweb.backend.Model.MensajesMensajeria;
import com.apiweb.backend.Model.UsuariosModel;
import com.apiweb.backend.Repository.IUsuariosRepository;
import com.apiweb.backend.Service.IMensajeriaService;



@RestController
@RequestMapping("/api/mensajeria")
public class MensajeriaController {

  @Autowired
  private IMensajeriaService mensajeriaService;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @Autowired
  private IUsuariosRepository usuarioRepository;

  @PostMapping("/crearChat")
  public ResponseEntity<MensajeriaModel> crearChat(@RequestBody MensajeriaModel chat) {
    MensajeriaModel nuevoChat = mensajeriaService.crearChat(chat);
    messagingTemplate.convertAndSend("/topic/nuevoChat", nuevoChat);
    return new ResponseEntity<>(nuevoChat, HttpStatus.CREATED);
  }

  @GetMapping("/conversaciones/{userId}")
  public ResponseEntity<List<MensajeriaModel>> obtenerConversacionesPorUsuario(@PathVariable String userId) {
    List<MensajeriaModel> conversaciones = mensajeriaService.obtenerConversacionesPorUsuario(userId);
    return ResponseEntity.ok(conversaciones);
  }
  @PostMapping("/mandarMensaje/{id}")
  public ResponseEntity<MensajeriaModel> mandarMensaje(
          @PathVariable("id") String id,
          @RequestBody MensajesMensajeria nuevoMsg) {
      System.out.println("Solicitud recibida para id: " + id);
      System.out.println("Datos recibidos: " + nuevoMsg.toString());  // Usa toString() para mejor legibilidad
      try {
          // Validar el ID antes de convertirlo
          if (!ObjectId.isValid(id)) {
              System.out.println("ID inválido: " + id);
              return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);  // 400 para ID inválido
          }
          ObjectId objectId = new ObjectId(id);
          System.out.println("ObjectId creado: " + objectId);
          MensajeriaModel result = mensajeriaService.mandarMensaje(objectId, nuevoMsg);
          System.out.println("Resultado del servicio: " + result);
          return ResponseEntity.ok(result);
      } catch (ResourceNotFoundException | UserNotFoundException e) {
          System.out.println("Excepción de recurso no encontrado: " + e.getMessage());
          return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
      } catch (InvalidUserRoleException e) {
          System.out.println("Excepción de rol inválido: " + e.getMessage());
          return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
      } catch (Exception e) {
          System.out.println("Error inesperado: " + e.getMessage());
          e.printStackTrace();  // Imprime el stack trace para más detalles
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
      }
  }

  @GetMapping("/verificarChat/{idInteresado}/{idAviso}")
      public ResponseEntity<MensajeriaModel> verificarChatExistente(
              @PathVariable String idInteresado,
              @PathVariable String idAviso) {
          Optional<MensajeriaModel> chat = mensajeriaService.findByInteresadoAndAviso(idInteresado, idAviso);
          return chat.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.ok(null)); // Retorna null si no existe
      }
    @GetMapping("/mostrarChat/{idMensajeria}")
    public ResponseEntity<MensajeriaModel> mostrarChat(@PathVariable("idMensajeria") String idMensajeria) {
      MensajeriaModel chat = mensajeriaService.mostrarChat(idMensajeria);

      for (MensajesMensajeria mensaje : chat.getMensajes()) {
          UsuariosModel remitente = usuarioRepository.findById(mensaje.getIdRemitente()).orElse(null);
          mensaje.setNombreRemitente(remitente != null ? remitente.getNombre() : "");
      }


      return new ResponseEntity<>(chat, HttpStatus.OK);
    }

    // Clase interna para el socket
    public static class MensajeSocket {
      public String idMensajeria;
      public MensajesMensajeria mensajes;
      public MensajeSocket(String idMensajeria, MensajesMensajeria mensajes) {
        this.idMensajeria = idMensajeria;
        this.mensajes = mensajes;
      }
    }
}
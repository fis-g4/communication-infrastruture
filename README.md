# Infraestructura de Mensajería con RabbitMQ para Microservicios

![Deployment](https://github.com/fis-g4/communication-microservice/actions/workflows/cd.yml/badge.svg)
![Tests](https://github.com/fis-g4/communication-microservice/actions/workflows/tests.yml/badge.svg)

Este repositorio es utilizado para la infraectuctura de RabbitMQ como sistema de mensajería para facilitar la comunicación eficiente entre microservicios. A continuación, se proporciona un resumen de la infraestructura.

## Componentes Principales

### 1. RabbitMQ
- Actúa como intermediario para la comunicación entre microservicios.
- Gestiona colas de mensajes, asegurando la entrega eficiente y desacoplada.

### 2. Productores de Mensajes
- Cada microservicio que envía información actúa como un productor de mensajes, publicando mensajes en colas específicas.

### 3. Colas
- Almacenan temporalmente los mensajes antes de ser consumidos por los microservicios suscritos.

### 4. Consumidores de Mensajes
- Microservicios que procesan mensajes suscribiéndose a colas relevantes.

## Flujo de Trabajo

1. **Productor Publica Mensaje:**
   - Un microservicio genera un mensaje y lo envía a una cola específica en RabbitMQ.

2. **Consumidores Procesan Mensajes:**
   - Los microservicios suscritos procesan mensajes según su lógica de negocio.

3. **Desacoplamiento:**
   - Comunicación asincrónica que permite a los microservicios operar de manera independiente.

4. **Escalabilidad:**
   - Capacidad de escalar consumidores para manejar aumentos de carga.

5. **Seguridad y Control de Acceso:**
   - RabbitMQ garantiza el acceso seguro a colas y mensajes.

## Configuración Adicional

- **Virtual Hosts:**
   - Organizan y aíslan diferentes entornos o aplicaciones en un mismo servidor RabbitMQ.

- **Seguridad:**
   - Mecanismos de seguridad, como usuarios y permisos, para controlar el acceso.
# Restful Booker API Tests

# Stack tecnológico

- Postman
- Newman
- Newman HTML Reporter
- GitHub Actions
- Git

## ¿Por qué elegí este stack?

Se eligió **Postman** porque permite construir y mantener pruebas API de manera rápida, clara y reutilizable, facilitando el manejo de colecciones, variables de ambiente y automatización mediante scripts en JavaScript.

Se utilizó **Newman** para ejecutar la colección desde línea de comandos e integrarla fácilmente en un proceso de Integración Continua (CI).

Finalmente, **GitHub Actions** permite automatizar la ejecución de la suite en cada cambio realizado al repositorio y publicar automáticamente el reporte de ejecución como artefacto.

---

# Estructura del proyecto

```
restful-booker-api-tests
│
├── collections
│   └── RestfulBooker.postman_collection.json
│
├── environments
│   ├── Dev.postman_environment.json
│   └── UAT.postman_environment.json
│
├── reports
│
├── .github
│   └── workflows
│       └── newman.yml
│
├── README.md
└── .gitignore
```

---

# Organización de la colección

La colección está organizada por funcionalidades para facilitar su mantenimiento.

```
Health
Authentication
Booking
    Create Booking
    Get Booking
    Update Booking
    Partial Update Booking
    Delete Booking

Negative Cases
    Missing Required Field
    Wrong Data Type
    Invalid Dates

---

# Separación de responsabilidades

Con el objetivo de evitar un único script monolítico, las responsabilidades fueron separadas de la siguiente manera:

### Construcción de peticiones

Cada request contiene únicamente:

- Método HTTP
- Endpoint
- Headers
- Body

### Datos de prueba

Los datos configurables se manejan mediante variables de ambiente:

- base_url
- username
- password
- token
- booking_id

Esto permite reutilizar la colección sin modificar los requests.

### Aserciones

Todas las validaciones se encuentran exclusivamente en la pestaña **Tests** de cada request.

Entre ellas:

- Status Code
- Campos obligatorios
- Tipos de datos
- Valores esperados
- JSON Schema
- Tiempo de respuesta

---

# Validación de esquema

El endpoint:

```
POST /booking
```

incluye validación completa mediante JSON Schema verificando:

- estructura de la respuesta
- campos obligatorios
- tipos de datos
- propiedades esperadas

Adicionalmente se realizan validaciones campo por campo para asegurar la consistencia de la información.

---

# Configuración por ambiente

La colección utiliza la variable:

```
{{base_url}}
```

Por ello puede ejecutarse sobre diferentes ambientes sin modificar el código.

Ejemplo:

### DEV

```
base_url=https://restful-booker.herokuapp.com
```

### UAT

```
base_url=https://restful-booker.herokuapp.com
```

El cambio de ambiente se realiza únicamente seleccionando el Environment correspondiente en Postman o mediante Newman.

---

# Ejecución local

## Clonar el proyecto

```bash
git clone https://github.com/bsanchezp/restful-booker-api-tests.git
```

```bash
cd restful-booker-api-tests
```

---

## Instalar Newman

```bash
npm install -g newman
```

```bash
npm install -g newman-reporter-html
```

---

## Ejecutar la colección

```bash
newman run collections/RestfulBooker.postman_collection.json -e environments/Dev.postman_environment.json
```
Cambio de ambiente: Para ejecutar la colección en otro ambiente, únicamente se debe cambiar el archivo indicado en el parámetro -e de Newman (por ejemplo, de Dev.postman_environment.json a UAT.postman_environment.json), sin modificar la colección ni los requests.
---

## Ejecutar con reporte HTML

```bash
newman run collections/RestfulBooker.postman_collection.json -e environments/Dev.postman_environment.json -r cli,html --reporter-html-export reports/newman-report.html
```

---

# Integración continua (GitHub Actions)

El proyecto cuenta con un pipeline de GitHub Actions que:

- descarga el repositorio
- instala Node.js
- instala Newman
- ejecuta la colección
- genera un reporte HTML
- publica el reporte como artefacto

Workflow:

```
.github/workflows/newman.yml
```

El reporte puede descargarse desde:

```
GitHub
→ Actions
→ API Tests
→ Artifacts
→ newman-html-report
```

---


# Bugs encontrados

# Bugs encontrados

## Bug 01: Manejo incorrecto de campos obligatorios

### Escenario
Se envía una solicitud para crear una reserva omitiendo un campo obligatorio, por ejemplo:

```json
{
  "lastname": "Sanchez",
  "totalprice": 500,
  "depositpaid": true,
  "bookingdates": {
    "checkin": "2026-08-10",
    "checkout": "2026-08-15"
  }
}
```

### Esperado

La API debería responder con:

```text
400 Bad Request
```

indicando que falta un campo obligatorio.

### Obtenido

La API responde con:

```text
500 Internal Server Error
```

### Impacto

La API no maneja correctamente los errores de validación de entrada y expone un error interno del servidor en lugar de informar un error de solicitud inválida.

---

## Bug 02: Validación insuficiente de tipos de datos

### Escenario

La API acepta valores con tipos de datos incorrectos en diferentes campos, por ejemplo:

```json
{
  "totalprice": "500",
  "depositpaid": "true",
}
```

### Esperado

La API debería responder con:

```text
400 Bad Request
```

indicando que:

- `totalprice` debe ser numérico.
- `depositpaid` debe ser booleano.

### Obtenido

La API crea la reserva  con un status 200.

### Impacto

La falta de validación de tipos de datos permite registrar información inconsistente, afectando la integridad de los datos almacenados.

---

## Bug 03: Validación insuficiente del formato de fechas

### Escenario

Se envían valores que no representan fechas válidas.

```json
{
  "bookingdates": {
    "checkin": "32-13-2026",
    "checkout": "99-02-2025"
  }
}
```

o incluso:

```json
{
  "bookingdates": {
    "checkin": "prueba",
    "checkout": "prueba"
  }
}
```

### Esperado

La API debería responder con:

```text
400 Bad Request
```

indicando que `checkin` y `checkout` deben contener fechas válidas.

### Obtenido

La API crea la reserva  con un status 200.

### Impacto

La API permite registrar reservas con fechas inválidas, lo que puede generar inconsistencias en la lógica de negocio y afectar procesos que dependen de la validez de las fechas.

# Autor

Beatriz Sanchez Paredes

QA Automation Engineer

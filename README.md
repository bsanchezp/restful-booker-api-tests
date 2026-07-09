# Restful Booker API Tests

# Stack Tecnológico

- Postman
- Newman
- Newman HTML Reporter
- GitHub Actions
- Git

## ¿Por qué este stack?

Se eligió **Postman** por su facilidad para construir y mantener pruebas API mediante colecciones reutilizables, variables de ambiente y scripts de validación en JavaScript.

**Newman** permite ejecutar la misma colección desde línea de comandos e integrarla fácilmente en procesos de Integración Continua (CI).

Finalmente, **GitHub Actions** automatiza la ejecución de la suite y publica el reporte HTML generado por Newman como artefacto del pipeline.

---

# Estructura del proyecto

```text
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

```text
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

Bug Validation
```

---

# Separación de responsabilidades

La solución se estructuró para evitar mezclar la construcción de peticiones, los datos y las validaciones en un único lugar.

### Construcción de peticiones

Cada request contiene únicamente:

- Método HTTP
- Endpoint
- Headers
- Body

### Datos de prueba

Los datos configurables se administran mediante variables de ambiente:

- base_url
- username
- password
- token
- booking_id

Esto permite reutilizar la colección en diferentes ambientes sin modificar los requests.

### Aserciones

Todas las validaciones se encuentran en la pestaña **Tests** de cada request.

Entre ellas:

- Status Code
- Campos obligatorios
- Tipos de datos
- Valores esperados
- Validación mediante JSON Schema
- Tiempo de respuesta

---

# Validación de esquema

El endpoint **POST /booking** implementa validación mediante **JSON Schema**, verificando:

- estructura de la respuesta
- campos obligatorios
- tipos de datos
- propiedades esperadas

Adicionalmente se realizan validaciones campo por campo para asegurar la consistencia de la información.

---

# Configuración por ambiente

La colección utiliza variables de entorno, por ejemplo:

```text
{{base_url}}
```

Esto permite ejecutar la misma colección en distintos ambientes sin modificar los requests.

Ejemplo:

DEV

```text
base_url=https://restful-booker.herokuapp.com
```

UAT

```text
base_url=https://restful-booker.herokuapp.com
```

---

# Ejecución local

## Clonar el proyecto

```bash
git clone https://github.com/bsanchezp/restful-booker-api-tests.git
cd restful-booker-api-tests
```

## Instalar dependencias

```bash
npm install -g newman
npm install -g newman-reporter-html
```

## Ejecutar la colección

DEV

```bash
newman run collections/RestfulBooker.postman_collection.json -e environments/Dev.postman_environment.json
```

UAT

```bash
newman run collections/RestfulBooker.postman_collection.json -e environments/UAT.postman_environment.json
```

> Para cambiar de ambiente únicamente se debe modificar el archivo indicado en el parámetro `-e`, sin realizar cambios en la colección.

## Generar reporte HTML

```bash
newman run collections/RestfulBooker.postman_collection.json \
-e environments/Dev.postman_environment.json \
-r cli,html \
--reporter-html-export reports/newman-report.html
```

---

# Integración Continua

El proyecto incorpora un pipeline de **GitHub Actions** que realiza automáticamente las siguientes actividades:

- Descarga el repositorio.
- Instala Node.js.
- Instala Newman y el HTML Reporter.
- Ejecuta la colección de Postman.
- Genera el reporte HTML.
- Publica el reporte como artefacto.
- Finaliza el pipeline con estado **Failed** cuando existen pruebas fallidas, manteniendo disponible el reporte para su análisis.

Workflow:

```text
.github/workflows/newman.yml
```

El reporte puede descargarse desde:

```text
GitHub
→ Actions
→ API Tests
→ Artifacts
→ newman-html-report
```

---

# Bugs encontrados

## Bug 01 – Manejo incorrecto de campos obligatorios

### Escenario

Se envía una solicitud sin el campo obligatorio `firstname`.

### Esperado

**400 Bad Request** indicando error de validación.

### Obtenido

**500 Internal Server Error**.

### Impacto

La API expone un error interno en lugar de informar un error de validación al cliente.

---

## Bug 02 – Validación insuficiente de tipos de datos

### Escenario

La API acepta tipos de datos incorrectos.

Ejemplo:

```json
{
  "totalprice": "500",
  "depositpaid": "true"
}
```

### Esperado

**400 Bad Request**.

### Obtenido

La API crea la reserva correctamente con **HTTP 200**.

### Impacto

Se permite almacenar información con tipos de datos inconsistentes.

---

## Bug 03 – Validación insuficiente del formato de fechas

### Escenario

La API acepta fechas inválidas.

```json
{
  "bookingdates": {
    "checkin": "32-13-2026",
    "checkout": "99-02-2025"
  }
}
```

o

```json
{
  "bookingdates": {
    "checkin": "prueba",
    "checkout": "prueba"
  }
}
```

### Esperado

**400 Bad Request**.

### Obtenido

La API crea la reserva correctamente con **HTTP 200**.

### Impacto

La API permite registrar reservas con fechas inválidas, afectando la integridad de la información.

---

# Autor

**Beatriz Sánchez Paredes**

QA Automation Engineer

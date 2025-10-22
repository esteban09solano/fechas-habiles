# 🗓️ API de Fechas Hábiles — Prueba Técnica

Esta API calcula fechas hábiles en **Colombia**, considerando:

- Días laborales (lunes a viernes).
- Horario laboral: **08:00 a.m. a 05:00 p.m.** (hora Colombia).
- Pausa de almuerzo: **12:00 p.m. a 01:00 p.m.**.
- Días festivos nacionales obtenidos desde la variable `HOLIDAYS_URL`.
- Conversión final al formato **UTC (ISO 8601 con Z)**.

El cálculo permite sumar una cantidad de **días** y/o **horas hábiles** a una fecha inicial.

---

## 🚀 Endpoint público desplegado

**URL de producción:**

```
https://fechas-habiles-production.up.railway.app/api/fechas_habiles
```

Ejemplo de uso:

```bash
curl "https://fechas-habiles-production.up.railway.app/api/fechas_habiles?days=1&hours=4"
```

---

## 🧰 Requisitos previos

Antes de ejecutar el proyecto localmente, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) versión **18 o superior**
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

---

## ⚙️ Instalación local

1. **Clonar el repositorio**

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Crear un archivo `.env`** en la raíz del proyecto con el siguiente contenido:

```env
PORT=3000
HOLIDAYS_URL=https://content.capta.co/Recruitment/WorkingDays.json
```

> ⚠️ Este archivo **no debe subirse al repositorio**.  
> Railway o cualquier otro entorno de despliegue debe definir las mismas variables desde su panel de configuración.

4. **Ejecutar el proyecto en modo desarrollo**

```bash
npm run dev
```

Esto iniciará el servidor en `http://localhost:3000`.

---

## 🌐 Uso local

Una vez en ejecución, puedes probar la API localmente:

```
http://localhost:3000/api/fechas_habiles?days=1&hours=4
```

O incluir el parámetro `date` (en UTC):

```
http://localhost:3000/api/fechas_habiles?date=2025-04-10T15:00:00.000Z&days=5&hours=4
```

---

## 📦 Scripts disponibles

| Comando | Descripción |
|----------|-------------|
| `npm run dev` | Ejecuta el servidor en modo desarrollo con `ts-node-dev`. |
| `npm run build` | Compila el código TypeScript a JavaScript en la carpeta `dist/`. |
| `npm start` | Ejecuta la versión compilada desde `dist/`. |

---

## 📄 Variables de entorno requeridas

| Variable | Descripción |
|-----------|-------------|
| `PORT` | Puerto del servidor (por defecto 3000). |
| `HOLIDAYS_URL` | URL con la lista de días festivos de Colombia. |

Ejemplo del archivo `.env`:

```env
PORT=3000
HOLIDAYS_URL=https://content.capta.co/Recruitment/WorkingDays.json
```

---

## ✅ Ejemplo de respuesta exitosa

**Petición:**
```
GET /api/fechas_habiles?days=1&hours=4
```

**Respuesta:**
```json
{ "date": "2025-08-01T14:00:00Z" }
```

---

## ⚠️ Ejemplo de error

**Petición inválida (sin parámetros):**
```
GET /api/fechas_habiles
```

**Respuesta (400):**
```json
{
  "error": "InvalidParameters",
  "message": "Debe enviar days y/o hours"
}
```

---

## 🧭 Notas finales

- Proyecto desarrollado completamente en **TypeScript** con tipado estricto.  
- Usa **Luxon** para manejo de zonas horarias (America/Bogota → UTC).  
- Se excluyen días festivos con base en el recurso definido en `HOLIDAYS_URL`.  
- Desplegado en **Railway** con variables de entorno configuradas desde el panel.  

---

🧡 **Autor:** Esteban Solano  
📍 **Deployment:** [https://fechas-habiles-production.up.railway.app/api/fechas_habiles](https://fechas-habiles-production.up.railway.app/api/fechas_habiles)

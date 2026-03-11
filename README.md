# Sistema de Gestión de Citas y Facturación

Este sistema automatiza el flujo entre la agenda de Google Calendar y el control de cobros internos. El núcleo del proyecto es la sincronización de eventos externos para transformarlos en registros de facturación, permitiendo un control estricto de deudas, saldos a favor y cálculos fiscales.

## 🎯 Resumen del Proyecto

El sistema permite dar de alta clientes, agendar citas en Google Calendar con un código de identificación y sincronizar esos datos mediante un proceso automático (cronjob) para gestionar pagos y facturas pendientes.

### Meta SMART

**"Desarrollar una aplicación web funcional en 3 meses utilizando Supabase y React que sincronice el 100% de las citas de Google Calendar, permitiendo identificar automáticamente a los deudores y calcular impuestos (IVA incluido) con una interfaz minimalista y fácil de usar"**.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React.js (Vite).
* **Estilos:** Tailwind CSS (para un diseño minimalista y rápido).
* **Backend & Base de Datos:** Supabase (PostgreSQL, Auth, y Edge Functions para el Cronjob).
* **Integración:** API de Google Calendar.

---

## 📊 Modelo de Datos (Entidades)

Basado en la estructura del diagrama:

* **Paciente:** Nombre, código generado, fecha de nacimiento y saldo a favor.
* **Servicio:** Nombre del servicio y precio general (IVA incluido).
* **Citas:** Vincula al paciente (o pareja) con la fecha, hora y estado de facturación.
* **Pagos:** Registro del monto, tipo de pago y confirmación de cobro.

---

## 🚀 Descarga e Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/gestor-citas-supabase.git
cd gestor-citas-supabase

```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ejecuta el script SQL (ubicado en `/supabase/migrations`) en el SQL Editor para crear las tablas de `Paciente`, `Citas`, `Servicios` y `Pagos`.

3. Habilita una **Edge Function** para el cronjob que conectará con la API de Google Calendar.

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
GOOGLE_CLIENT_ID=tu_client_id

```

### 4. Instalar dependencias y ejecutar

```bash
npm install
npm run dev

```

---

## 💡 Detalles de Implementación

* **Sincronización:** El cronjob debe verificar cancelaciones y reagendaciones en Google Calendar, aplicando penalizaciones si el flujo de negocio lo requiere.
* **Citas de Pareja:** El sistema admite hasta 2 pacientes por cita.
* **Autocobro:** Si un paciente tiene "saldo a favor", el sistema debe marcar la cita como pagada automáticamente al sincronizarse.

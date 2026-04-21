# 🌌 Vortex Finance

> **El futuro de la gestión financiera personal y familiar, impulsado por Inteligencia Artificial.**

Vortex Finance es una plataforma moderna de gestión financiera diseñada para familias e individuos que valoran el control absoluto sobre sus finanzas. Con un enfoque en la **privacidad**, el **análisis inteligente** y la **automatización**, Vortex permite categorizar gastos, visualizar métricas en tiempo real y chatear con un asesor financiero empoderado por IA Local, todo dentro de una interfaz de usuario verdaderamente premium.

---

## ✨ Características Principales

- **🛡️ Autenticación Multi-usuario:** Sistema de registro y login seguro gestionado por InsForge. Cada usuario tiene su propio espacio de trabajo cifrado.
- **🤖 Asesor de IA Local (Vortex AI):** Integración nativa con **LM Studio** corriendo modelos de forma local (ej. Gemma 4, Llama 3) garantizando privacidad absoluta (0% datos a servidores externos). La IA procesa transacciones en lote (JSON arrays) y actúa como un asesor financiero contextual.
- **📊 Analíticas Interactivas y Dinámicas:** Gráficos fluidos y responsivos construidos con Recharts que adaptan automáticamente los balances y muestran comparativas de Ingresos vs Gastos en tiempo real.
- **📱 Progressive Web App (PWA):** Instalable en cualquier dispositivo móvil (iOS/Android), con soporte para navegación offline, manifiesto nativo y cacheo predictivo mediante Service Workers (`next-pwa`).
- **📥 Exportación de Reportes a CSV:** Descarga el historial financiero filtrado con un solo clic, sin dependencias pesadas, utilizando la API nativa de JavaScript.
- **✨ UX/UI Premium:** Diseño enfocado en el detalle con *Dark Mode* por defecto, micro-interacciones con **Framer Motion**, y sistema centralizado de notificaciones (*Toasts*) usando **Sonner**.
- **🏗️ Clean Architecture:** Frontend escalable dividido en capas de Servicios (Manejo de Base de Datos) y Componentes de Presentación.

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
| :--- | :--- |
| **Framework Base** | Next.js 16.2 (App Router) |
| **Estilos & UI** | Tailwind CSS v4, Lucide React |
| **Backend & Base de Datos** | InsForge (SDK) |
| **Inteligencia Artificial** | LM Studio (API REST compatible con OpenAI) |
| **Animaciones** | Framer Motion |
| **Visualización de Datos** | Recharts |
| **Notificaciones** | Sonner |
| **Gestor de Paquetes** | pnpm |

---

## 🧠 Arquitectura Híbrida de Datos

Vortex Finance implementa una arquitectura híbrida única y poderosa:

1.  **Datos Persistentes (Nube - InsForge):** Las credenciales de autenticación y los registros de transacciones se almacenan de forma segura en las bases de datos en la nube de InsForge. Esto permite sincronización inmediata en múltiples dispositivos.
2.  **Procesamiento Analítico (Local - LM Studio):** El análisis inteligente de transacciones y el procesamiento de lenguaje natural ocurren enteramente en la máquina del cliente mediante un servidor local de Inferencia (LM Studio). Esto evita costos en APIs de terceros y asegura que el comportamiento financiero de la familia nunca salga de su red privada para ser analizado.

---

## 🚀 Guía de Instalación y Despliegue

### Requisitos Previos
- Node.js 18+ y `pnpm` instalados.
- Cuenta activa en **InsForge** con un bucket configurado.
- (Opcional) **LM Studio** ejecutándose localmente en el puerto `1234` con un modelo compatible cargado (ej. Gemma 4, Llama 3 o Qwen).

### Paso a paso

**1. Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/vortex-finance.git
cd vortex-finance
```

**2. Instalar dependencias:**
```bash
pnpm install
```

**3. Configurar Variables de Entorno:**
Crea un archivo `.env.local` en la raíz del proyecto. Deberás obtener tus credenciales desde tu panel de control en InsForge:

```env
# URL de conexión a tu proyecto en InsForge
NEXT_PUBLIC_INSFORGE_URL=tu_insforge_url_aqui

# Llave pública de API (Anon Key)
NEXT_PUBLIC_INSFORGE_ANON_KEY=tu_insforge_anon_key_aqui

# (Opcional) URL local para la inferencia de IA. LM Studio corre en 1234 por defecto.
LM_STUDIO_URL=http://localhost:1234/v1/chat/completions
```

**4. Ejecutar la aplicación en entorno de desarrollo:**
```bash
pnpm dev
```
La aplicación estará disponible en `http://localhost:3000`.

**5. Compilar para Producción:**
```bash
pnpm build
pnpm start
```

---

*Desarrollado con pasión, Clean Architecture y Next.js. Listo para escalar.* 🚀

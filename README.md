# 🌱 Dashboard Fresas - Sistema de Riego IoT

Dashboard en tiempo real para monitoreo de sistema de riego de fresas conectado a InfluxDB Cloud.

## ✨ Características

- 📊 **Monitoreo en tiempo real** de 2 zonas de riego
- 🌊 **Estado del sistema de riego** (runtime, consumo de agua)
- 🔍 **Queries ejecutables** directamente desde la interfaz web
- 🚨 **Sistema de alertas** para condiciones anómalas
- 📱 **Responsive design** para móvil y desktop
- ☁️ **Conectado a InfluxDB Cloud** para datos reales

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de InfluxDB Cloud configurada

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/dashboard-fresas.git
cd dashboard-fresas

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Construir para producción
npm run build
```

### Despliegue en Vercel

1. Conecta tu repositorio GitHub con Vercel
2. Configura las variables de entorno (si es necesario)
3. Despliega automáticamente

## ⚙️ Configuración

El dashboard está preconfigurado para conectarse a:
- **InfluxDB Cloud**: us-east-1-1.aws.cloud2.influxdata.com
- **Organización**: Fresas
- **Bucket**: invernaderos

### Variables de Entorno (Opcional)

Puedes configurar variables de entorno para mayor seguridad:

```env
REACT_APP_INFLUX_URL=https://us-east-1-1.aws.cloud2.influxdata.com
REACT_APP_INFLUX_TOKEN=tu-token-aqui
REACT_APP_INFLUX_ORG=Fresas
REACT_APP_INFLUX_BUCKET=invernaderos
```

## 📊 Funcionalidades

### Dashboard Principal
- Vista en tiempo real de inv2_zona1_zone e inv2_zona2_zone
- Estado de riego (activo/inactivo)
- Runtime actual por zona
- Última actualización

### Queries en Vivo
- **Estado del Sistema de Riego**: Runtime actual de todas las zonas
- **Consumo de Agua**: Consumo total por zona en 24h
- **Detección de Anomalías**: Runtime anormalmente alto
- **Estadísticas del Sistema**: Total de datos almacenados

### Sistema de Alertas
- Monitoreo de conexión a InfluxDB
- Alertas de riego activo
- Estado general del sistema

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework principal
- **InfluxDB Client** - Conexión a base de datos
- **Tailwind CSS** - Estilos y diseño
- **Lucide React** - Iconos
- **Recharts** - Gráficos (preparado para uso futuro)

## 📱 Capturas de Pantalla

### Dashboard Principal
Vista en tiempo real con estado de las zonas de riego.

### Queries en Tiempo Real  
Ejecución de queries Flux directamente desde la interfaz.

### Sistema de Alertas
Monitoreo de estado y alertas del sistema.

## 🔧 Desarrollo

### Estructura del Proyecto

```
dashboard-fresas/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── GreenhouseDashboard.js  # Componente principal
│   ├── App.js                  # App principal
│   ├── index.js               # Punto de entrada
│   └── App.css                # Estilos
├── package.json
└── README.md
```

### Comandos Disponibles

```bash
npm start      # Servidor de desarrollo
npm run build  # Construir para producción
npm test       # Ejecutar tests
npm run eject  # Exponer configuración (no recomendado)
```

## 🌐 Despliegue

El proyecto está optimizado para desplegarse en:
- **Vercel** (recomendado)
- **Netlify** 
- **GitHub Pages**
- Cualquier hosting estático

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

Proyecto desarrollado para monitoreo de sistema de fresas con InfluxDB Cloud.

---

⭐ ¡Dale una estrella al proyecto si te ha sido útil!

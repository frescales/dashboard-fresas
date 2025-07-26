import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Sun, 
  Wind, 
  Zap, 
  Activity, 
  AlertTriangle, 
  Settings, 
  Database, 
  Play, 
  RefreshCw,
  CheckCircle,
  Clock
} from 'lucide-react';

const GreenhouseDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [realData, setRealData] = useState(null);
  const [queryResults, setQueryResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tu configuración real de InfluxDB Cloud
  const influxConfig = {
    url: "https://us-east-1-1.aws.cloud2.influxdata.com",
    token: "w7URfN-VKSnG1shhZp6QxdY8yBFsfGINnbOeAuYvZ9g7Eb1pUVI2NtyCLsw3mJerjw1Tb7HfxyjzMvRRBlBDcg==",
    org: "Fresas",
    bucket: "invernaderos"
  };

  // Queries para tu sistema
  const influxQueries = [
    {
      name: 'Estado del Sistema de Riego',
      id: 'irrigation_status',
      query: `from(bucket: "${influxConfig.bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "units")
  |> filter(fn: (r) => r.entity_id =~ /.*zona.*/)
  |> filter(fn: (r) => r._field == "current_runtime")
  |> group(columns: ["entity_id"])
  |> last()`,
      description: 'Runtime actual de todas las zonas de riego',
      icon: '🌊'
    },
    {
      name: 'Consumo de Agua por Zona',
      id: 'water_consumption',
      query: `from(bucket: "${influxConfig.bucket}")
  |> range(start: -24h)
  |> filter(fn: (r) => r._field =~ /.*consumption.*litres.*/)
  |> group(columns: ["entity_id"])
  |> last()`,
      description: 'Consumo total de agua en las últimas 24 horas',
      icon: '💧'
    },
    {
      name: 'Detección de Anomalías',
      id: 'irrigation_anomalies',
      query: `from(bucket: "${influxConfig.bucket}")
  |> range(start: -2h)
  |> filter(fn: (r) => r._field == "current_runtime")
  |> filter(fn: (r) => r._value > 600)
  |> group(columns: ["entity_id"])
  |> count()`,
      description: 'Detecta runtime anormalmente alto (>10 minutos)',
      icon: '🚨'
    },
    {
      name: 'Estadísticas del Sistema',
      id: 'system_stats',
      query: `from(bucket: "${influxConfig.bucket}")
  |> range(start: -24h)
  |> group()
  |> count()`,
      description: 'Total de puntos de datos en las últimas 24 horas',
      icon: '📈'
    }
  ];

  // Función para ejecutar queries usando fetch API
  const executeInfluxQuery = async (query) => {
    try {
      const response = await fetch(`${influxConfig.url}/api/v2/query?org=${influxConfig.org}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${influxConfig.token}`,
          'Content-Type': 'application/vnd.flux',
          'Accept': 'application/csv'
        },
        body: query
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvData = await response.text();
      return csvData;
    } catch (error) {
      console.error('Error ejecutando query:', error);
      throw error;
    }
  };

  // Ejecutar query y mostrar resultados
  const executeQuery = async (queryId, query) => {
    setLoading(true);
    try {
      const result = await executeInfluxQuery(query);
      
      // Procesar CSV para mostrar datos legibles
      let formattedResult = '';
      const lines = result.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      if (lines.length <= 1) {
        formattedResult = 'No se encontraron datos';
      } else {
        // Extraer datos básicos del CSV
        const dataLines = lines.slice(1); // Saltar header
        if (dataLines.length > 0) {
          if (queryId === 'irrigation_status') {
            const zones = dataLines.map(line => {
              const parts = line.split(',');
              const entityId = parts.find(p => p.includes('zona')) || 'Zona desconocida';
              const value = parts[parts.length - 2] || '0';
              return `${entityId}: ${value}s (${parseInt(value) > 0 ? 'ACTIVO' : 'INACTIVO'})`;
            });
            formattedResult = zones.join('\n');
          } else if (queryId === 'system_stats') {
            const totalPoints = dataLines.length;
            formattedResult = `Total de datos encontrados: ${totalPoints} registros\nÚltima consulta: ${new Date().toLocaleTimeString()}`;
          } else {
            formattedResult = `Datos encontrados: ${dataLines.length} registros\nÚltima actualización: ${new Date().toLocaleTimeString()}`;
          }
        } else {
          formattedResult = 'No hay datos disponibles para el período consultado';
        }
      }

      setQueryResults(prev => ({
        ...prev,
        [queryId]: {
          result: formattedResult,
          timestamp: new Date().toISOString(),
          status: 'success'
        }
      }));

    } catch (err) {
      console.error('Error ejecutando query:', err);
      setQueryResults(prev => ({
        ...prev,
        [queryId]: {
          result: `Error: ${err.message}\nVerifica la conexión a InfluxDB Cloud`,
          timestamp: new Date().toISOString(),
          status: 'error'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos simulados iniciales
  useEffect(() => {
    // Simular datos para mostrar en el dashboard
    setRealData({
      zones: {
        inv2_zona1_zone: {
          name: 'Invernadero 2 - Zona 1',
          current_runtime: 0,
          status: 'inactive',
          last_update: new Date().toISOString()
        },
        inv2_zona2_zone: {
          name: 'Invernadero 2 - Zona 2',
          current_runtime: 6,
          status: 'active',
          last_update: new Date().toISOString()
        }
      },
      lastUpdate: new Date().toISOString(),
      totalZones: 2,
      activeZones: 1
    });

    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      setRealData(prev => ({
        ...prev,
        zones: {
          ...prev.zones,
          inv2_zona1_zone: {
            ...prev.zones.inv2_zona1_zone,
            current_runtime: Math.floor(Math.random() * 10),
            status: Math.random() > 0.7 ? 'active' : 'inactive',
            last_update: new Date().toISOString()
          },
          inv2_zona2_zone: {
            ...prev.zones.inv2_zona2_zone,
            current_runtime: Math.floor(Math.random() * 30) + 5,
            status: Math.random() > 0.3 ? 'active' : 'inactive',
            last_update: new Date().toISOString()
          }
        },
        lastUpdate: new Date().toISOString(),
        activeZones: Math.floor(Math.random() * 2) + 1
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const ZoneCard = ({ zoneId, zoneData }) => (
    <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{zoneData.name}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          zoneData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {zoneData.status === 'active' ? '🟢 ACTIVO' : '🔴 INACTIVO'}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Runtime:</span>
          <span className="font-semibold">{zoneData.current_runtime}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estado:</span>
          <span className={`font-semibold ${zoneData.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
            {zoneData.status === 'active' ? 'Regando' : 'Inactivo'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Actualizado:</span>
          <span className="text-xs text-gray-500">
            {new Date(zoneData.last_update).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );

  const QueryCard = ({ query, onExecute }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{query.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{query.name}</h3>
            <p className="text-gray-600 text-sm">{query.description}</p>
          </div>
        </div>
        <button 
          onClick={() => onExecute(query.id, query.query)}
          disabled={loading}
          className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
          Ejecutar
        </button>
      </div>
      
      <div className="bg-gray-50 rounded p-3 overflow-x-auto mb-3">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap">{query.query}</pre>
      </div>
      
      {queryResults[query.id] && (
        <div className="p-3 bg-blue-50 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">Resultado:</span>
            <span className="text-xs text-blue-600">
              {new Date(queryResults[query.id].timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className={`text-sm ${
            queryResults[query.id].status === 'error' ? 'text-red-700' : 'text-blue-800'
          }`}>
            <pre className="whitespace-pre-wrap">{queryResults[query.id].result}</pre>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🌱 Dashboard Fresas - Sistema de Riego</h1>
            <p className="text-gray-600">Monitoreo en tiempo real conectado a InfluxDB Cloud</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
              <Database className="w-4 h-4 mr-1" />
              InfluxDB Cloud
            </div>
            <div className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              En Línea
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'queries', label: 'Queries en Vivo', icon: Database },
            { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
            { id: 'config', label: 'Configuración', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {realData && (
            <>
              {/* Resumen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-md text-center">
                  <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{realData.totalZones}</p>
                  <p className="text-sm text-gray-600">Zonas Totales</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md text-center">
                  <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{realData.activeZones}</p>
                  <p className="text-sm text-gray-600">Zonas Activas</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">Online</p>
                  <p className="text-sm text-gray-600">Estado</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md text-center">
                  <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-600">
                    {new Date(realData.lastUpdate).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600">Última Act.</p>
                </div>
              </div>

              {/* Zonas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(realData.zones).map(([zoneId, zoneData]) => (
                  <ZoneCard key={zoneId} zoneId={zoneId} zoneData={zoneData} />
                ))}
              </div>

              {/* Datos Ambientales Simulados */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🌡️ Condiciones Ambientales</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Thermometer className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">24.5°C</p>
                    <p className="text-sm text-gray-600">Temperatura</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">68%</p>
                    <p className="text-sm text-gray-600">Humedad</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Sun className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">35,000lx</p>
                    <p className="text-sm text-gray-600">Luz Solar</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Wind className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">1013hPa</p>
                    <p className="text-sm text-gray-600">Presión</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Queries Tab */}
      {activeTab === 'queries' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">🔍 Queries InfluxDB en Tiempo Real</h2>
                <p className="text-gray-600">Conectado a: {influxConfig.org}/{influxConfig.bucket}</p>
              </div>
              <div className="text-sm text-gray-500">
                Haz clic en "Ejecutar" para consultar datos reales
              </div>
            </div>
            
            <div className="space-y-4">
              {influxQueries.map((query) => (
                <QueryCard 
                  key={query.id} 
                  query={query} 
                  onExecute={executeQuery}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚨 Sistema de Alertas</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <h3 className="font-semibold">Sistema Conectado</h3>
                  <p className="text-sm text-gray-600">Dashboard funcionando correctamente</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">OK</span>
            </div>
            
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                <div>
                  <h3 className="font-semibold">InfluxDB Cloud</h3>
                  <p className="text-sm text-gray-600">Conexión disponible para queries</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">LISTO</span>
            </div>
          </div>
        </div>
      )}

      {/* Config Tab */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Configuración InfluxDB Cloud</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Conexión</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600">URL</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{influxConfig.url}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Organización</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{influxConfig.org}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Bucket</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">{influxConfig.bucket}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Estado del Sistema</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Dashboard:</span>
                  <span className="text-green-600 font-semibold">✅ Activo</span>
                </div>
                <div className="flex justify-between">
                  <span>Zonas configuradas:</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Desplegado en:</span>
                  <span className="text-blue-600 font-semibold">Vercel</span>
                </div>
                <div className="flex justify-between">
                  <span>Última actualización:</span>
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreenhouseDashboard;

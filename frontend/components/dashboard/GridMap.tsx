'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGISStore } from '@/store/gisStore';
import { gridService } from '@/services/gridService';
import { AlertTriangle, MapPin } from 'lucide-react';

// Default center (e.g., Delhi coordinates, or you can dynamically calculate based on nodes)
const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090];
const DEFAULT_ZOOM = 11;

export function GridMap() {
  const { nodes, setNodes, selectedNodeId, setSelectedNode } = useGISStore();
  const [isLoading, setIsLoading] = useState(true);

  // Load meters on mount
  useEffect(() => {
    const loadMeters = async () => {
      try {
        const meters = await gridService.getMeters();
        setNodes(meters);
      } catch (error) {
        console.error('Failed to load map nodes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMeters();
  }, [setNodes]);

  if (isLoading) {
    return (
      <div className="glass-panel h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
      </div>
    );
  }

  const nodesList = Object.values(nodes);

  return (
    <div className="glass-panel overflow-hidden relative h-[400px] rounded-xl border border-[var(--border-default)]">
      <MapContainer 
        center={nodesList.length > 0 ? [nodesList[0].latitude, nodesList[0].longitude] : DEFAULT_CENTER} 
        zoom={DEFAULT_ZOOM} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {nodesList.map((node) => {
          const isCritical = node.current_risk_score && node.current_risk_score > 0.75;
          const isWarning = node.current_risk_score && node.current_risk_score > 0.5 && node.current_risk_score <= 0.75;
          const isSelected = selectedNodeId === node.id;
          
          let fillColor = '#3b82f6'; // blue
          if (isCritical) fillColor = '#f43f5e'; // rose
          else if (isWarning) fillColor = '#f59e0b'; // amber

          return (
            <CircleMarker
              key={node.id}
              center={[node.latitude, node.longitude]}
              pathOptions={{
                fillColor,
                color: isSelected ? '#ffffff' : fillColor,
                weight: isSelected ? 2 : 1,
                fillOpacity: 0.8,
              }}
              radius={isSelected ? 10 : isCritical ? 8 : 6}
              eventHandlers={{
                click: () => setSelectedNode(node.id),
              }}
            >
              <Popup className="grid-popup">
                <div className="p-1 font-sans">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                    {isCritical ? <AlertTriangle className="w-4 h-4 text-rose-500" /> : <MapPin className="w-4 h-4 text-blue-500" />}
                    <h3 className="font-bold text-sm text-gray-900 m-0">{node.consumer_name}</h3>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-700">
                    <p><span className="font-semibold">Meter ID:</span> {node.meter_number}</p>
                    <p><span className="font-semibold">Address:</span> {node.address}</p>
                    
                    {node.current_risk_score !== undefined && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100">
                        <p className="font-semibold text-gray-900 mb-1">Live AI Assessment</p>
                        <p>Risk Score: <span className={isCritical ? 'text-rose-600 font-bold' : ''}>{(node.current_risk_score * 100).toFixed(1)}%</span></p>
                        {node.current_anomaly_type && node.current_anomaly_type !== 'NORMAL' && (
                          <p>Anomaly: {node.current_anomaly_type.replace(/_/g, ' ')}</p>
                        )}
                        {node.current_financial_loss && node.current_financial_loss > 0 && (
                          <p className="text-rose-600">Est. Loss: ₹{node.current_financial_loss.toFixed(2)}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

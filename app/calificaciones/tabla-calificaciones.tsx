"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Id } from "@/convex/_generated/dataModel";

// Registrar los módulos de AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

// Tipo para la estructura de datos de calificaciones
interface Calificacion {
  _id: Id<"calificaciones">;
  estudianteId: Id<"estudiantes">;
  materiaId: Id<"materias">;
  nota: number;
  semestre: string;
  estudiante: {
    id: Id<"estudiantes">;
    nombre: string;
    numMatricula: string;
  } | null;
  materia: {
    id: Id<"materias">;
    nombreMateria: string;
    identificador: string;
  } | null;
}

export function TablaCalificaciones() {
  const router = useRouter();
  const calificaciones = useQuery(api.calificaciones.obtenerCalificaciones) as Calificacion[] | undefined;
  
  // Estado para AG Grid con tipos adecuados
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  // Removed unused gridColumnApi state

  // Definición de columnas para AG Grid con tipos adecuados
  const columnDefs = useMemo<ColDef[]>(() => [
    { 
      headerName: "Matrícula", 
      field: "estudiante.numMatricula", 
      sortable: true, 
      filter: true,
      flex: 1
    },
    { 
      headerName: "Estudiante", 
      field: "estudiante.nombre", 
      sortable: true, 
      filter: true,
      flex: 2
    },
    { 
      headerName: "Materia", 
      field: "materia.nombreMateria", 
      sortable: true, 
      filter: true,
      flex: 2
    },
    { 
      headerName: "Clave", 
      field: "materia.identificador", 
      sortable: true, 
      filter: true,
      flex: 1
    },
    { 
      headerName: "Nota", 
      field: "nota", 
      sortable: true, 
      filter: true,
      cellStyle: (params: { value: number }) => {
        if (params.value < 6) return { color: 'red' };
        else if (params.value >= 9) return { color: 'green' };
        return null;
      },
      flex: 1
    },
    { 
      headerName: "Semestre", 
      field: "semestre", 
      sortable: true, 
      filter: true,
      flex: 1
    },
  ], []);

  // Configuración por defecto de AG Grid
  const defaultColDef = useMemo(() => ({
    resizable: true,
  }), []);

  // Manejar el evento de clic en una fila
  const onRowClicked = (event: RowClickedEvent) => {
    router.push(`/calificaciones/${event.data._id}`);
  };

  // Manejar el evento cuando AG Grid está lista
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  // Actualizar el tamaño de la cuadrícula cuando cambian los datos
  useEffect(() => {
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
  }, [calificaciones, gridApi]);

  const handleCrear = () => {
    router.push("/calificaciones/create");
  };

  if (calificaciones === undefined) {
    return <div>Cargando calificaciones...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Lista de Calificaciones</h2>
        <Button onClick={handleCrear} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Calificación
        </Button>
      </div>
      
      <div className="w-full h-[500px]">
        <AgGridReact
          rowData={calificaciones}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onRowClicked={onRowClicked}
          pagination={true}
          paginationPageSize={10}
          animateRows={true}
          rowSelection="single"
        />
      </div>
    </div>
  );
}
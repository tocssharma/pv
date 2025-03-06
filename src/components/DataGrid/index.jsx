import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

const DataGrid = ({ data }) => {
  // Convert Map data to array format
  const flattenData = useMemo(() => {
    const rows = [];
    
    data?.forEach((children, parentId) => {
      children.forEach(child => {
        const row = {
          id: child.id,
          parent: parentId,
          group: child.group,
          attributes: child.attributes,
          relationships: child.relationships
        };
        rows.push(row);
      });
    });

    return rows;
  }, [data]);

  // Column definitions
  const columnHelper = createColumnHelper();
  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('parent', {
      header: 'Parent',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('group', {
      header: 'Group',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('attributes', {
      header: 'Attributes',
      cell: info => {
        const attrs = info.getValue();
        return (
          <div className="max-h-20 overflow-y-auto">
            {attrs?.map((attr, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{attr.key}:</span>{' '}
                {attr.value}
              </div>
            ))}
          </div>
        );
      },
    }),
    columnHelper.accessor('relationships', {
      header: 'Relationships',
      cell: info => {
        const rels = info.getValue();
        return (
          <div className="max-h-20 overflow-y-auto">
            {rels?.map((rel, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{rel.type}:</span>{' '}
                {rel.successor}
                {rel.condition && ` (${rel.condition})`}
              </div>
            ))}
          </div>
        );
      },
    }),
  ], []);

  const table = useReactTable({
    data: flattenData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataGrid;
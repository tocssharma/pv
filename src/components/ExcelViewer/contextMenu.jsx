import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Edit2, Trash2 } from 'lucide-react';

export const ContextMenu = ({ children, onEdit, onDelete }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem 
          onClick={onEdit}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onDelete}
          className="flex items-center gap-2 cursor-pointer text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContextMenu;
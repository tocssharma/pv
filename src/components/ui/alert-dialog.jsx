// components/ui/alert-dialog.jsx
import * as RadixAlertDialog from '@radix-ui/react-alert-dialog';
import React from 'react';

const AlertDialog = RadixAlertDialog.Root;
const AlertDialogTrigger = RadixAlertDialog.Trigger;

const AlertDialogContent = React.forwardRef(({ children, ...props }, ref) => (
  <RadixAlertDialog.Portal>
    <RadixAlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
    <RadixAlertDialog.Content
      ref={ref}
      className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-white p-6 shadow-lg rounded-lg w-full max-w-md"
      {...props}
    >
      {children}
    </RadixAlertDialog.Content>
  </RadixAlertDialog.Portal>
));
AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogHeader = ({ className, ...props }) => (
  <div className="mb-4" {...props} />
);

const AlertDialogFooter = ({ className, ...props }) => (
  <div className="mt-6 flex justify-end gap-4" {...props} />
);

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <RadixAlertDialog.Title
    ref={ref}
    className="text-lg font-semibold leading-none"
    {...props}
  />
));
AlertDialogTitle.displayName = 'AlertDialogTitle';

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <RadixAlertDialog.Description
    ref={ref}
    className="mt-2 text-sm text-gray-600"
    {...props}
  />
));
AlertDialogDescription.displayName = 'AlertDialogDescription';

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <RadixAlertDialog.Action
    ref={ref}
    className="inline-flex items-center justify-center px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
    {...props}
  />
));
AlertDialogAction.displayName = 'AlertDialogAction';

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <RadixAlertDialog.Cancel
    ref={ref}
    className="inline-flex items-center justify-center px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
    {...props}
  />
));
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
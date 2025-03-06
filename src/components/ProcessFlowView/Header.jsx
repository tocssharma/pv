import React, { useState } from 'react';
import { 
  FoldersIcon, 
  Menu, 
  FileText,
  Database,
  Share2,
  LogOut,
  Upload,
  UserCircle,
  Settings,
  Lock,
  Eye
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, 
  DialogFooter
} from '../ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import ExcelViewer from '../ExcelViewer/index5.jsx';
import LoginDialog from '../../components/LoginDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ReactComponent as LogoSVG }  from '../../assets/Reliance_Jio_Logo.svg';
const Header = () => {
  const [showExcelViewer, setShowExcelViewer] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { userRole, isAuthenticated, login, logout } = useAuth();
  const { data } = useData();

  const handleLoginClick = () => {
    setShowLoginDialog(true);
  };

  const handleLoginSuccess = async (password) => {
    return await login(password);
  };

  // Define menu items based on authentication status
  const getMenuItems = () => {
    const baseMenuItems = [
      {
        label: 'View Options',
        items: [
          { 
            icon: <Eye className="w-4 h-4 mr-2" />, 
            label: 'View Data', 
            onClick: () => setShowExcelViewer(true) 
          },
        ]
      }
    ];
    return baseMenuItems;
  };

  if (showExcelViewer) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shadow-md">
          {/* Left section with logo and title */}
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-lg">
              <FoldersIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold">Jio Business Process Viewer</h1>
          </div>
          
          {/* Right section with badge and back button in single container */}
          <div className="flex items-center space-x-4">
            <Badge variant={isAuthenticated ? "success" : "secondary"}>
              {isAuthenticated ? 'Admin' : 'Guest'}
            </Badge>
      {/* Fixed position back button */}
      <Button 
        variant="ghost"
        size="sm"
        onClick={() => setShowExcelViewer(false)}
        className="text-white hover:bg-white/10"
      >
        Back
      </Button>          </div>
        </div>
        
        {/* Content area *
        <div className="flex-1 overflow-hidden p-4">
           {console.log("excedlviewervisibility",showExcelViewer)}
          <ExcelViewer />
        </div>
      </div>*/}

        <div className="fixed inset-0 bg-white z-40 mt-[73px]">
        <div className="h-full w-full overflow-auto">
           {console.log("excedlviewervisibility",showExcelViewer)}
          <ExcelViewer />
        </div>
          </div></div>

          
    );
  }

  // Normal header view
  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-2 rounded-lg">
          <LogoSVG className={`h-8 w-auto`} />
          </div>
          <h1 className="text-xl font-semibold">Jio Business Process Management</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center mr-4">
            <Badge variant={isAuthenticated ? "success" : "secondary"} className="mr-2">
              {isAuthenticated ? 'Admin' : 'Guest'}
            </Badge>
            {!isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLoginClick}
                className="text-white hover:bg-white/10"
              >
                <Lock className="w-4 h-4 mr-2" />
                Login as Admin
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {getMenuItems().map((section, idx) => (
                <React.Fragment key={section.label}>
                  {idx > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel>{section.label}</DropdownMenuLabel>
                  {section.items.map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={item.onClick}
                    >
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LoginDialog 
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export { Header };
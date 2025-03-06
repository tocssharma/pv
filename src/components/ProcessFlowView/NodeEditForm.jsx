import React, { useState, useEffect } from 'react';


import ProcessDataHandler from "../../lib/dataHelper";

import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

import { 
  Input
} from '../ui/input';

import { 
    Dialog, DialogContent, DialogHeader, DialogTitle,
  } from '../ui/dialog';
 
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "../ui/card";


  import { 
Button, 
  } from '../ui/button';

  import { 
    Label
     } from '../ui/label';

     import { 
           Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
         } from '../ui/select';
    
     import { 
           Checkbox,
         } from '../ui/checkbox';
       
         const NodeEditForm = ({ node, onSave, onCancel, allNodes }) => {
            const LEVELS =ProcessDataHandler.LEVELS;
            
            const levelConfig = LEVELS[node.level];
        
            
            const [formData, setFormData] = useState({
              name: node.name || '',
              metadata: node.metadata || {},
              relationships: node.relationships || {
                predecessor: [],
                condition: {}
              }
            });
          
            const getSiblings = () => {
              return Object.values(allNodes).filter(n => 
                n.level === node.level && n.id !== node.id
              );
            };
          
            const handleMetadataChange = (field, value) => {
              setFormData(prev => ({
                ...prev,
                metadata: {
                  ...prev.metadata,
                  [field]: value
                }
              }));
            };
          
            const handlePredecessorChange = (predecessorId, checked) => {
              setFormData(prev => ({
                ...prev,
                relationships: {
                  ...prev.relationships,
                  predecessor: checked 
                    ? [...(prev.relationships.predecessor || []), predecessorId]
                    : (prev.relationships.predecessor || []).filter(id => id !== predecessorId)
                }
              }));
            };
          
            return (
              <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Edit Node</CardTitle>
                  <CardDescription>Modify the properties and relationships of this node</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>ID</Label>
                          <Input value={node.id} disabled className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label>ID Format</Label>
                          <Input value={levelConfig.idformat} disabled className="bg-gray-50" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Input value={levelConfig.type} disabled className="bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={levelConfig.name}
                          />
                        </div>
                      </div>
                    </div>
          
                    <Separator />
          
                    {/* Metadata Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Metadata</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {levelConfig.metadata.map((field) => (
                          <div key={field} className="space-y-2">
                            <Label className="capitalize">{field}</Label>
                            <Select
                              value={formData.metadata[field]}
                              onValueChange={(value) => handleMetadataChange(field, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${field}`} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="option1">Option 1</SelectItem>
                                <SelectItem value="option2">Option 2</SelectItem>
                                <SelectItem value="custom">
                                  <Input 
                                    placeholder="Add custom value"
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleMetadataChange(field, e.target.value);
                                    }}
                                    className="mt-2"
                                  />
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
          
                    <Separator />
          
                    {/* Relationships Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Predecessors</h3>
                      <ScrollArea className="h-48 rounded-md border p-4">
                        <div className="space-y-2">
                          {getSiblings().map((sibling) => (
                            <div key={sibling.id} className="flex items-center gap-4 p-2 rounded hover:bg-gray-50">
                              <Checkbox
                                checked={(formData.relationships.predecessor || []).includes(sibling.id)}
                                onCheckedChange={(checked) => handlePredecessorChange(sibling.id, checked)}
                              />
                              <span className="min-w-[120px]">{sibling.name}</span>
                              {(formData.relationships.predecessor || []).includes(sibling.id) && (
                                <Input
                                  placeholder="Enter condition"
                                  value={formData.relationships.condition?.[sibling.id] || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    relationships: {
                                      ...prev.relationships,
                                      condition: {
                                        ...(prev.relationships.condition || {}),
                                        [sibling.id]: e.target.value
                                      }
                                    }
                                  }))}
                                  className="flex-1"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
          
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                      <Button variant="outline" onClick={onCancel}>
                        Cancel
                      </Button>
                      <Button onClick={() => onSave(formData)}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          };
          
          export default NodeEditForm;
import React, { useState } from 'react';
import { Button } from "@/components/ui/8bit/button";
import { Input } from "@/components/ui/8bit/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/8bit/card";
import { Label } from "@/components/ui/8bit/label";

interface NameInputProps {
  onSubmitName: (name: string) => void;
}

export const NameInput: React.FC<NameInputProps> = ({ onSubmitName }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmitName(name.trim());
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px]">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle>Enter Your Name</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name" className="text-sm text-muted-foreground">Founder Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Smith"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 flex justify-end">
            <Button type="submit" disabled={!name.trim()}>Next</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}; 
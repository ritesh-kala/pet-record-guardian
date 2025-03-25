
import React from 'react';
import { Button } from '@/components/ui/button';
import { PawPrint, User, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="pb-12 pt-6 md:pt-10 md:pb-20">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6 animate-slideIn">
          <div>
            <h1 className="font-serif text-4xl leading-tight md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight font-medium">
              Keep track of your pet's health with ease
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-xl">
              A simple, elegant way to manage your pet's medical records, appointments, 
              and health information in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
          <div className="grid gap-4">
            <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center hover-lift animate-slideIn" style={{ animationDelay: '0.1s' }}>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <PawPrint className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Pet Profiles</h3>
              <p className="text-sm text-muted-foreground mt-1">Store detailed information about your pets</p>
            </div>
            
            <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center hover-lift animate-slideIn" style={{ animationDelay: '0.3s' }}>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mb-3">
                <User className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-medium">Owner Profiles</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage multiple owner profiles</p>
            </div>
          </div>
          
          <div className="grid gap-4 pt-8">
            <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center hover-lift animate-slideIn" style={{ animationDelay: '0.2s' }}>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                <Stethoscope className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-medium">Medical Records</h3>
              <p className="text-sm text-muted-foreground mt-1">Keep track of vet visits and treatments</p>
            </div>
            
            <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center hover-lift animate-slideIn" style={{ animationDelay: '0.4s' }}>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                <CalendarIcon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-medium">Appointments</h3>
              <p className="text-sm text-muted-foreground mt-1">Schedule and track upcoming appointments</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Need to create a CalendarIcon since we're missing this import
const CalendarIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export default Hero;

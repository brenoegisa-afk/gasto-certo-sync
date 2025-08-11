import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface FinancialCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "success" | "warning" | "danger";
  hover?: boolean;
}

export function FinancialCard({ 
  children, 
  className, 
  variant = "default",
  hover = true
}: FinancialCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300",
        {
          "bg-gradient-card shadow-card": variant === "default",
          "bg-gradient-primary text-white shadow-finance": variant === "gradient",
          "bg-gradient-success text-white shadow-card": variant === "success",
          "bg-finance-orange text-white shadow-card": variant === "warning",
          "bg-finance-red text-white shadow-card": variant === "danger",
          "hover:shadow-card-hover hover:scale-[1.02]": hover,
        },
        className
      )}
    >
      {children}
    </Card>
  );
}
import React from "react";
import { cn } from "@/lib/utils";

// Design Tokens
export const tokens = {
  colors: {
    primary: "hsl(var(--primary))",
    primaryForeground: "hsl(var(--primary-foreground))",
    secondary: "hsl(var(--secondary))",
    secondaryForeground: "hsl(var(--secondary-foreground))",
    accent: "hsl(var(--accent))",
    accentForeground: "hsl(var(--accent-foreground))",
    muted: "hsl(var(--muted))",
    mutedForeground: "hsl(var(--muted-foreground))",
    destructive: "hsl(var(--destructive))",
    destructiveForeground: "hsl(var(--destructive-foreground))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    border: "hsl(var(--border))",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "4rem",
  },
  borderRadius: {
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    xl: "calc(var(--radius) + 4px)",
    full: "9999px",
  },
};

// Typography
interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-3xl font-bold tracking-tight text-foreground md:text-4xl scroll-m-20",
        className
      )}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2
      className={cn(
        "text-2xl font-semibold tracking-tight text-foreground md:text-3xl scroll-m-20",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className }: TypographyProps) {
  return (
    <h3
      className={cn(
        "text-xl font-semibold tracking-tight text-foreground md:text-2xl scroll-m-20",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function Subtitle({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-lg text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function Paragraph({ children, className }: TypographyProps) {
  return (
    <p className={cn("leading-7 text-foreground [&:not(:first-child)]:mt-6", className)}>
      {children}
    </p>
  );
}

export function Muted({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

// Layout Components
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

export function Container({ children, className, fullHeight }: ContainerProps) {
  return (
    <div
      className={cn(
        "container px-4 mx-auto max-w-7xl",
        fullHeight && "min-h-[calc(100vh-4rem)]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageSection({ children, className }: PageSectionProps) {
  return (
    <section className={cn("py-8 md:py-12", className)}>
      {children}
    </section>
  );
}

// Update the PageHeaderProps interface to accept children
interface PageHeaderProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 space-y-2", className)}>
      {children ? children : (
        <>
          <H1>{title}</H1>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </>
      )}
    </div>
  );
}

// Animation Components 
interface FadeInProps {
  children: React.ReactNode;
  delay?: string;
  className?: string;
}

export function FadeIn({ children, delay = "0ms", className }: FadeInProps) {
  return (
    <div
      className={cn(
        "animate-fade-in",
        className
      )}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

// Card Variations
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function CardGlass({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardGradient({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-card to-secondary/80 backdrop-blur-sm p-6 rounded-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}

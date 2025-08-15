"use client"

import * as React from "react"

import {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent as SheetContentPrimitive,
  SheetHeader as SheetHeaderPrimitive,
  SheetFooter as SheetFooterPrimitive,
  SheetTitle as SheetTitlePrimitive,
  SheetDescription as SheetDescriptionPrimitive,
} from "@/components/ui/sheet"

import { cn } from "@/lib/utils"

const Drawer = Sheet
const DrawerTrigger = SheetTrigger
const DrawerPortal = SheetPortal
const DrawerClose = SheetClose
const DrawerOverlay = SheetOverlay

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof SheetContentPrimitive>,
  React.ComponentPropsWithoutRef<typeof SheetContentPrimitive>
>(({ className, children, ...props }, ref) => (
  <SheetContentPrimitive
    ref={ref}
    side="bottom"
    className={cn("rounded-t-[10px]", className)}
    {...props}
  >
    <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
    {children}
  </SheetContentPrimitive>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = SheetHeaderPrimitive
const DrawerFooter = SheetFooterPrimitive
const DrawerTitle = SheetTitlePrimitive
const DrawerDescription = SheetDescriptionPrimitive

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}


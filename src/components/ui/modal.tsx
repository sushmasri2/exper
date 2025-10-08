import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  dialogContentVariants,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Trash2,
  HelpCircle,
  type LucideIcon
} from "lucide-react"

type ModalType = "default" | "alert" | "confirmation" | "form" | "simple"
type AlertType = "success" | "error" | "warning" | "info"
type ConfirmationType = "delete" | "warning" | "info" | "success"

interface ModalProps
  extends React.ComponentPropsWithoutRef<typeof Dialog>,
  VariantProps<typeof dialogContentVariants> {
  // Basic props
  trigger?: React.ReactNode
  title?: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  showCloseButton?: boolean
  closeButtonText?: string
  className?: string
  onClose?: () => void

  // Modal type and variants
  type?: ModalType
  variant?: AlertType | ConfirmationType

  // Alert/Confirmation specific
  message?: string
  icon?: React.ReactNode | LucideIcon
  showIcon?: boolean
  autoClose?: boolean
  autoCloseDelay?: number

  // Confirmation specific
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  destructive?: boolean
  loading?: boolean
  confirmButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass" | "primaryBtn"

  // Form specific
  submitText?: string
  onSubmit?: (formData: FormData) => void | Promise<void>
  formId?: string
  resetOnSubmit?: boolean
  disabled?: boolean
}

// Helper functions for different modal types
const getAlertConfig = (variant: AlertType) => {
  switch (variant) {
    case "success":
      return {
        icon: CheckCircle,
        className: "border-green-300 shadow-xl dark:border-green-800",
        iconClassName: "text-green-500 dark:text-green-400",
        buttonVariant: "default" as const,
      }
    case "error":
      return {
        icon: XCircle,
        className: "border-red-300 shadow-xl dark:border-red-800",
        iconClassName: "text-red-500 dark:text-red-400",
        buttonVariant: "destructive" as const,
      }
    case "warning":
      return {
        icon: AlertTriangle,
        className: "border-yellow-300 shadow-xl dark:border-yellow-800",
        iconClassName: "text-yellow-500 dark:text-yellow-400",
        buttonVariant: "default" as const,
      }
    case "info":
    default:
      return {
        icon: Info,
        className: "border-blue-300 shadow-xl dark:border-blue-800",
        iconClassName: "text-blue-500 dark:text-blue-400",
        buttonVariant: "default" as const,
      }
  }
}

const getConfirmationConfig = (variant: ConfirmationType) => {
  switch (variant) {
    case "delete":
      return {
        icon: Trash2,
        title: "Delete Item",
        confirmVariant: "destructive" as const,
        iconClassName: "text-red-600 dark:text-red-400",
        className: "border-red-300 shadow-lg dark:border-red-600 dark:shadow-2xl",
      }
    case "warning":
      return {
        icon: AlertTriangle,
        title: "Warning",
        confirmVariant: "destructive" as const,
        iconClassName: "text-yellow-500 dark:text-yellow-400",
        className: "border-yellow-300 shadow-2xl dark:border-yellow-700 dark:shadow-2xl",
      }
    case "success":
      return {
        icon: CheckCircle,
        title: "Confirm Action",
        confirmVariant: "default" as const,
        iconClassName: "text-green-500 dark:text-green-400",
        className: "border-green-300 shadow-2xl dark:border-green-700 dark:shadow-2xl",
      }
    case "info":
    default:
      return {
        icon: HelpCircle,
        title: "Confirm Action",
        confirmVariant: "default" as const,
        iconClassName: "text-blue-500 dark:text-blue-400",
        className: "border-blue-300 shadow-2xl dark:border-blue-700 dark:shadow-2xl",
      }
  }
}

const Modal = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  ModalProps
>(
  (
    {
      // Basic props
      trigger,
      title,
      description,
      children,
      footer,
      showCloseButton = true,
      closeButtonText = "Close",
      size = "default",
      className,
      onClose,
      open,
      onOpenChange,

      // Modal type and variants
      type = "default",
      variant,

      // Alert/Confirmation specific
      message,
      icon,
      showIcon = true,
      autoClose = false,
      autoCloseDelay = 3000,

      // Confirmation specific
      confirmText = "Confirm",
      cancelText = "Cancel",
      onConfirm,
      onCancel,
      destructive,
      loading = false,
      confirmButtonVariant,

      // Form specific
      submitText = "Submit",
      onSubmit,
      formId,
      resetOnSubmit = false,
      disabled = false,

      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)
    const generatedFormId = React.useId()
    const finalFormId = formId || generatedFormId

    // Auto close functionality for alerts
    React.useEffect(() => {
      if (autoClose && open && type === "alert") {
        const timer = setTimeout(() => {
          onOpenChange?.(false)
        }, autoCloseDelay)

        return () => clearTimeout(timer)
      }
    }, [autoClose, autoCloseDelay, open, onOpenChange, type])

    const handleOpenChange = (isOpen: boolean) => {
      if (!isOpen && onClose) {
        onClose()
      }
      onOpenChange?.(isOpen)
    }

    const handleConfirm = async () => {
      if (onConfirm) {
        try {
          setIsLoading(true)
          await onConfirm()
        } catch (error) {
          console.error("Confirmation action failed:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    const handleCancel = () => {
      if (formRef.current && resetOnSubmit) {
        formRef.current.reset()
      }
      if (onCancel) {
        onCancel()
      }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (onSubmit) {
        try {
          setIsLoading(true)
          const formData = new FormData(event.currentTarget)
          await onSubmit(formData)

          if (resetOnSubmit) {
            event.currentTarget.reset()
          }
        } catch (error) {
          console.error("Form submission failed:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    // Get configuration based on type and variant
    const alertConfig = type === "alert" && variant ? getAlertConfig(variant as AlertType) : null
    const confirmConfig = type === "confirmation" && variant ? getConfirmationConfig(variant as ConfirmationType) : null

    // Determine final values
    const finalTitle = title || confirmConfig?.title || (type === "alert" ? (variant as string).charAt(0).toUpperCase() + (variant as string).slice(1) : undefined)
    const finalDescription = description || (type === "alert" || type === "confirmation" ? message : undefined)
    const finalSize = type === "confirmation" || type === "alert" ? "sm" : size
    const finalClassName = cn(
      type === "simple" && "p-0 border-0 bg-transparent shadow-none",
      alertConfig?.className,
      confirmConfig?.className,
      className
    )

    // Render icon
    const renderIcon = () => {
      if (!showIcon || (type !== "alert" && type !== "confirmation")) return null

      if (icon) {
        if (React.isValidElement(icon)) {
          return icon
        }
        if (typeof icon === 'function') {
          const IconComponent = icon as LucideIcon
          const iconClass = alertConfig?.iconClassName || confirmConfig?.iconClassName
          return <IconComponent className={cn("h-6 w-6", iconClass)} />
        }
      }

      const DefaultIcon = alertConfig?.icon || confirmConfig?.icon
      if (DefaultIcon) {
        const iconClass = alertConfig?.iconClassName || confirmConfig?.iconClassName
        return <DefaultIcon className={cn("h-6 w-6", iconClass)} />
      }

      return null
    }

    // Render footer based on type
    const renderFooter = () => {
      if (footer) return footer

      switch (type) {
        case "alert":
          return (
            <DialogClose asChild>
              <Button
                variant={alertConfig?.buttonVariant || "default"}
                onClick={onConfirm}
                disabled={loading || isLoading}
                className="w-full sm:w-auto"
              >
                {(loading || isLoading) ? "Loading..." : closeButtonText}
              </Button>
            </DialogClose>
          )

        case "confirmation":
          return (
            <>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading || isLoading}
                >
                  {cancelText}
                </Button>
              </DialogClose>
              <Button
                variant={destructive ? "destructive" : confirmButtonVariant || confirmConfig?.confirmVariant || "default"}
                onClick={handleConfirm}
                disabled={loading || isLoading}
              >
                {(loading || isLoading) ? "Loading..." : confirmText}
              </Button>
            </>
          )

        case "form":
          return (
            <>
              {showCloseButton && (
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading || isLoading}
                  >
                    {cancelText}
                  </Button>
                </DialogClose>
              )}
              <Button
                type="submit"
                form={finalFormId}
                variant="default"
                disabled={loading || isLoading || disabled}
              >
                {(loading || isLoading) ? "Submitting..." : submitText}
              </Button>
            </>
          )

        default:
          return showCloseButton ? (
            <DialogClose asChild>
              <Button variant="outline">{closeButtonText}</Button>
            </DialogClose>
          ) : null
      }
    }

    // Render content based on type
    const renderContent = () => {
      if (type === "alert" || type === "confirmation") {
        return (
          <div className="flex items-start gap-4">
            {renderIcon() && (
              <div className="flex-shrink-0 mt-1">
                {renderIcon()}
              </div>
            )}
            <div className="flex-1">
              {children}
            </div>
          </div>
        )
      }

      if (type === "form") {
        return (
          <form
            ref={formRef}
            id={finalFormId}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {children}
          </form>
        )
      }

      // Default, simple, or custom content
      return children ? (
        <div className={type !== "simple" ? "py-4" : ""}>
          {children}
        </div>
      ) : null
    }

    return (
      <Dialog open={open} onOpenChange={handleOpenChange} {...props}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          ref={ref}
          size={finalSize}
          className={finalClassName}
          aria-describedby={finalDescription ? undefined : "modal-content"}
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.select2-dropdown')) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.select2-dropdown')) {
              e.preventDefault();
            }
          }}
        >
          {(finalTitle || finalDescription) && type !== "simple" && (
            <DialogHeader>
              {finalTitle && <DialogTitle>{finalTitle}</DialogTitle>}
              {finalDescription && <DialogDescription>{finalDescription}</DialogDescription>}
            </DialogHeader>
          )}
          {!finalDescription && type !== "simple" && (
            <DialogDescription id="modal-content" className="sr-only">
              Modal content
            </DialogDescription>
          )}

          {renderContent()}

          {renderFooter() && type !== "simple" && (
            <DialogFooter className="flex gap-3 justify-end mt-6">
              {renderFooter()}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    )
  }
)
Modal.displayName = "Modal"

// Hook for programmatic modal usage
interface UseModalReturn {
  showModal: (config: Omit<ModalProps, 'open' | 'onOpenChange'>) => void
  hideModal: () => void
  ModalComponent: React.ComponentType
}

const useModal = (): UseModalReturn => {
  const [modalConfig, setModalConfig] = React.useState<ModalProps | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const showModal = React.useCallback((config: Omit<ModalProps, 'open' | 'onOpenChange'>) => {
    setModalConfig(config)
    setIsOpen(true)
  }, [])

  const hideModal = React.useCallback(() => {
    setIsOpen(false)
    // Clear config after animation completes
    setTimeout(() => setModalConfig(null), 200)
  }, [])

  const ModalComponent = React.useMemo(() => {
    return function ModalComponent() {
      if (!modalConfig) return null

      return (
        <Modal
          {...modalConfig}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      )
    }
  }, [modalConfig, isOpen])

  return { showModal, hideModal, ModalComponent }
}

// Form field wrapper component for better integration with form modals
interface FormFieldProps {
  name: string
  label?: string
  error?: string
  required?: boolean
  children: React.ReactElement
  className?: string
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  error,
  required = false,
  children,
  className,
}) => {
  const childProps = {
    name,
    id: name,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${name}-error` : undefined,
  }

  const child = React.cloneElement(children, childProps)

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {child}
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}

// Form validation hook
interface UseFormValidationProps {
  validationRules?: Record<string, (value: unknown) => string | null>
}

interface UseFormValidationReturn {
  errors: Record<string, string>
  validateField: (name: string, value: unknown) => void
  validateForm: (formData: FormData) => boolean
  clearErrors: () => void
  clearFieldError: (name: string) => void
}

const useFormValidation = ({
  validationRules = {},
}: UseFormValidationProps = {}): UseFormValidationReturn => {
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validateField = React.useCallback(
    (name: string, value: unknown) => {
      const rule = validationRules[name]
      if (rule) {
        const error = rule(value)
        setErrors(prev => ({
          ...prev,
          [name]: error || "",
        }))
        return !error
      }
      return true
    },
    [validationRules]
  )

  const validateForm = React.useCallback(
    (formData: FormData) => {
      const newErrors: Record<string, string> = {}
      let isValid = true

      Object.keys(validationRules).forEach(fieldName => {
        const value = formData.get(fieldName)
        const rule = validationRules[fieldName]
        const error = rule(value)
        if (error) {
          newErrors[fieldName] = error
          isValid = false
        }
      })

      setErrors(newErrors)
      return isValid
    },
    [validationRules]
  )

  const clearErrors = React.useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = React.useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }, [])

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
  }
}

export {
  Modal,
  FormField,
  useModal,
  useFormValidation,
  type ModalProps,
  type ModalType,
  type AlertType,
  type ConfirmationType,
  type FormFieldProps,
  type UseModalReturn,
  type UseFormValidationProps,
  type UseFormValidationReturn
}
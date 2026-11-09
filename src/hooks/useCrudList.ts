import { useState } from 'react'
import { useToast } from '../context/ToastContext'

interface CrudMessages<T> {
    createSuccess: string
    updateSuccess: string
    saveError: string
    deleteSuccess: string
    deleteError: string
    getDeleteConfirm: (item: T) => string
}

interface Params<T, P> extends CrudMessages<T> {
    vehicleId: number | null
    create: (vehicleId: number, payload: P) => Promise<unknown>
    update: (id: number, payload: P) => Promise<unknown>
    remove: (id: number) => Promise<unknown>
    onChanged: () => void
}

export function useCrudList<T extends { id: number }, P>({
    vehicleId,
    create,
    update,
    remove,
    onChanged,
    createSuccess,
    updateSuccess,
    saveError,
    deleteSuccess,
    deleteError,
    getDeleteConfirm,
}: Params<T, P>) {
    const { toast } = useToast()
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<T | null>(null)

    const openCreateForm = () => {
        setEditing(null)
        setShowForm(true)
    }

    const openEditForm = (item: T) => {
        setEditing(item)
        setShowForm(true)
    }

    const closeForm = () => {
        setShowForm(false)
        setEditing(null)
    }

    const handleSubmit = async (payload: P) => {
        if (!vehicleId) return
        try {
            if (editing) {
                await update(editing.id, payload)
                toast.success(updateSuccess)
            } else {
                await create(vehicleId, payload)
                toast.success(createSuccess)
            }
            closeForm()
            onChanged()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : saveError)
        }
    }

    const handleDelete = async (item: T) => {
        if (!confirm(getDeleteConfirm(item))) return
        try {
            await remove(item.id)
            toast.success(deleteSuccess)
            onChanged()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : deleteError)
        }
    }

    return {
        showForm,
        editing,
        openCreateForm,
        openEditForm,
        closeForm,
        handleSubmit,
        handleDelete,
    }
}

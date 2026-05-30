import { useState } from 'react';
import client from '../api/client.js';
import ConfirmModal from './ConfirmModal.jsx';

export default function OptionsPosts({ user, post, onDelete, titleModal, messageModal, confirmText, cancelText }) {

    const isOwner = user?.username === post.author;

    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    async function handleDelete() {
        try {
            const { data } = await client.delete(`/api/posts/${post.id}`);

            if (data.success) {
                onDelete(post.id);
                setShowDeleteModal(false);
                setShowMenu(false);
            }
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className="relative">
            <button
                onClick={() => {setShowMenu(!showMenu); console.log(user?.username, post.author)}}
                className="p-2 rounded-full hover:bg-white/10 transition"
            >
                ⋮
            </button>
            {showMenu && (
                <div className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg min-w-[150px]">
                    {isOwner && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-red-500"
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            )}
            {showDeleteModal && (
                        <ConfirmModal
                            open={showDeleteModal}
                            title={titleModal || "Eliminar post"}
                            message={messageModal || "¿Estás seguro de que quieres eliminar este post?"}
                            confirmText={confirmText || "Eliminar"}
                            cancelText={cancelText || "Cancelar"}
                            onConfirm={handleDelete}
                            onCancel={() => setShowDeleteModal(false)}
                            danger
                        />
                    )}
        </div>
    );
}

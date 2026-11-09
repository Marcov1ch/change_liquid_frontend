import type { User } from '../../types';

interface Props {
    user: User | null;
}

export function ProfileUserCard({ user }: Props) {
    return (
        <div className="md3-card p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-headline-md text-primary shrink-0">
                    {user?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                    <p className="text-title-md text-surface-on">{user?.username}</p>
                    <p className="text-body-md text-outline">{user?.email}</p>
                    {user && (
                        <span className={`inline-block mt-1 text-label-sm ${user.email_verified ? 'text-[#1B5E1B]' : 'text-[#7A6100]'}`}>
                            {user.email_verified ? 'Email подтверждён' : 'Email не подтверждён'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Date formatting utilities
 */

export function formatDate(dateString: string): string {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return 'Unknown date';
    }
}

export function formatRelativeTime(dateString: string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 30) {
            return formatDate(dateString);
        }
        if (diffDays > 0) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        }
        if (diffHours > 0) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        }
        if (diffMins > 0) {
            return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        }
        return 'Just now';
    } catch {
        return 'Unknown';
    }
}

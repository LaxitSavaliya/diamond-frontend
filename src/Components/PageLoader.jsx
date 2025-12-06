import { Loader } from 'lucide-react';

const PageLoader = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <span className="loading loading-spinner text-info loading-xl"></span>
        </div>
    );
}

export default PageLoader;
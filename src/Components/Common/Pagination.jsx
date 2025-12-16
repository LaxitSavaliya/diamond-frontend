import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
    page,
    totalPages,
    onPrev,
    onNext,
}) => {
    return (
        <div className="mt-auto py-3 flex justify-center items-center gap-5 sticky bottom-0 bg-base-100 bg-opacity-80 backdrop-blur-md">
            <ChevronLeft
                className="cursor-pointer hover:bg-primary hover:text-base-100 rounded-full p-1 size-8"
                onClick={() => page > 1 && onPrev()}
            />
            <span>{page} / {totalPages}</span>
            <ChevronRight
                className="cursor-pointer hover:bg-primary hover:text-base-100 rounded-full p-1 size-8"
                onClick={() => page < totalPages && onNext()}
            />
        </div>
    );
};

export default Pagination;
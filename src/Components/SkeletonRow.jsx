const SkeletonRow = () => {
    return (
        <tr className="animate-pulse">
            <td className="p-4">
                <div className="h-4 w-10 bg-base-300 rounded"></div>
            </td>
            <td className="p-4">
                <div className="h-4 w-32 bg-base-300 rounded"></div>
            </td>
            <td className="p-4 text-center">
                <div className="h-6 w-12 bg-base-300 rounded-full mx-auto"></div>
            </td>
            <td className="p-4 text-center">
                <div className="h-8 w-20 bg-base-300 rounded mx-auto"></div>
            </td>
        </tr>
    )
};

export default SkeletonRow;
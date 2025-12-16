import { useQuery } from "@tanstack/react-query";
import {
    allClarity,
    allColor,
    allParty,
    allPaymentStatus,
    allShape,
    allStatus,
} from "../Lib/api";

export const useMasterData = () => {
    const parties = useQuery({ queryKey: ["party"], queryFn: allParty });
    const shapes = useQuery({ queryKey: ["shape"], queryFn: allShape });
    const colors = useQuery({ queryKey: ["color"], queryFn: allColor });
    const clarities = useQuery({ queryKey: ["clarity"], queryFn: allClarity });
    const statuses = useQuery({ queryKey: ["status"], queryFn: allStatus });
    const paymentStatuses = useQuery({
        queryKey: ["paymentStatus"],
        queryFn: allPaymentStatus,
    });

    return {
        parties: parties.data,
        shapes: shapes.data,
        colors: colors.data,
        clarities: clarities.data,
        statuses: statuses.data,
        paymentStatuses: paymentStatuses.data,
        isLoading:
            parties.isLoading ||
            shapes.isLoading ||
            colors.isLoading ||
            clarities.isLoading ||
            statuses.isLoading ||
            paymentStatuses.isLoading,
    };
};
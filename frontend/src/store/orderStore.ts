import { defineStore } from 'pinia';
import axios , { isAxiosError }from 'axios';
import type {  Meta } from '@/types';
import type { IOrder, responseOrders} from '@/types/order';

export const orderStore = defineStore('order', () => {
    const api = axios.create({
        baseURL: 'http://14.225.217.42:5000/api',
      });
      api.interceptors.request.use((config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });
      const error = ref<string | null>(null);
      const Meta = ref<Meta>();
      const Orders = ref<IOrder[]>([])
    const fetchOrder = async () => {
        try{
        error.value = null;
        const responseOrder = await api.get<responseOrders>(
                `/orders/admin?page=1&limit=100`
              );
        Meta.value = responseOrder.data.meta;
        Orders.value = responseOrder.data.data;
        console.log(Orders.value)
    }
        catch (err: unknown) {
            error.value = isAxiosError(err)
              ? err.response?.data?.message || err.message
              : 'Unknown error occurred';
            console.error('Error fetching order rating:', err);
          }
    }
return {
    Orders,
    Meta,
    fetchOrder,
}
})
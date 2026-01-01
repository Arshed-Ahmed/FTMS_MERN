import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Calendar as CalendarIcon, Clock, CheckCircle, ChevronLeft, ChevronRight, List, Grid, GripVertical } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Layout from '../components/Layout';
import { useOrders } from '../hooks/useQueries';
import { useUpdateOrder } from '../hooks/useMutations';

const CalendarPage = () => {
  const { data: ordersData = [], isLoading } = useOrders();
  const updateOrderMutation = useUpdateOrder();

  const [orders, setOrders] = useState<any[]>([]);
  const [view, setView] = useState('calendar'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (ordersData) {
      // Filter out delivered orders if you only want active tasks
      const activeOrders = ordersData.filter((o: any) => o.status !== 'Delivered');
      
      // Sort by delivery date
      activeOrders.sort((a: any, b: any) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
      
      setOrders(activeOrders);
    }
  }, [ordersData]);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newDate = destination.droppableId; // droppableId is the date string (yyyy-MM-dd)
    
    // Optimistic update
    const updatedOrders = orders.map(order => {
      if (order._id === draggableId) {
        return { ...order, deliveryDate: newDate };
      }
      return order;
    });
    setOrders(updatedOrders);

    try {
      // We only update the delivery date here. 
      // In a real app, you might want to check if it's a fitOnDate or deliveryDate being moved.
      // For simplicity, we assume dragging moves the delivery date.
      await updateOrderMutation.mutateAsync({ id: draggableId, data: { deliveryDate: newDate } });
      toast.success(`Rescheduled to ${format(new Date(newDate), 'MMM d')}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to reschedule');
      // Revert
      if (ordersData) {
        const activeOrders = ordersData.filter((o: any) => o.status !== 'Delivered');
        activeOrders.sort((a: any, b: any) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
        setOrders(activeOrders);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex space-x-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Previous Month">
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Next Month">
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            {weekDays.map(day => (
              <div key={day} className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-300">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 dark:bg-gray-600 gap-px">
            {calendarDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayOrders = orders.filter(o => isSameDay(new Date(o.deliveryDate), day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <Droppable droppableId={dateKey} key={dateKey}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[120px] bg-white dark:bg-gray-800 p-2 transition-colors ${
                        !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400' : ''
                      } ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className={`text-right text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayOrders.map((order, index) => (
                          <Draggable key={order._id} draggableId={order._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`text-xs p-1.5 rounded border shadow-sm cursor-move truncate transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 z-50' : ''
                                } ${
                                  order.status === 'Ready' ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-800 dark:text-green-200' :
                                  order.status === 'In Progress' ? 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-200' :
                                  'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-800 dark:text-yellow-200'
                                }`}
                              >
                                <div className="flex items-center">
                                  <GripVertical className="w-3 h-3 mr-1 opacity-50" />
                                  <span className="font-medium truncate">
                                    {order.customer?.firstName ? `${order.customer.firstName} ${order.customer.lastName || ''}` : (order.customer?.name || 'Customer')}
                                  </span>
                                </div>
                                <div className="pl-4 truncate opacity-75">{order.item || 'Order'}</div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    );
  };

  return (
    <Layout title="Schedule & Deadlines">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Delivery Deadline</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span>Fit-on Date</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-1 flex">
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded ${view === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            title="Calendar View"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <>
          {view === 'calendar' ? renderCalendar() : (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No active orders scheduled.</div>
              ) : (
                orders.map((order) => {
                  const daysRemaining = getDaysRemaining(order.deliveryDate);
                  let statusColor = 'bg-blue-100 text-blue-800';
                  if (daysRemaining < 0) statusColor = 'bg-red-100 text-red-800';
                  else if (daysRemaining <= 2) statusColor = 'bg-yellow-100 text-yellow-800';
                  else statusColor = 'bg-green-100 text-green-800';

                  return (
                    <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${statusColor} shrink-0`}>
                          <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.customer?.firstName} {order.customer?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{order.style?.name}</p>
                          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Due: {formatDate(order.deliveryDate)}
                            </span>
                            {order.fitOnDate && (
                              <span className="flex items-center text-purple-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Fit On: {formatDate(order.fitOnDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex flex-col items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className={`text-sm font-medium ${daysRemaining < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : 
                           daysRemaining === 0 ? 'Due Today' : 
                           `${daysRemaining} days remaining`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default CalendarPage;

import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, CheckCircle, AlertCircle, User, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

const KanbanBoard = ({ jobs, onStatusChange, onPrint }) => {
  const columns = {
    'Pending': {
      title: 'Pending',
      items: jobs.filter(job => job.status === 'Pending'),
      color: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-800 dark:text-yellow-300',
      icon: Clock
    },
    'In Progress': {
      title: 'In Progress',
      items: jobs.filter(job => job.status === 'In Progress'),
      color: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-300',
      icon: AlertCircle
    },
    'Completed': {
      title: 'Completed',
      items: jobs.filter(job => job.status === 'Completed'),
      color: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-300',
      icon: CheckCircle
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      onStatusChange(draggableId, destination.droppableId);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        {Object.entries(columns).map(([columnId, column]) => {
          const Icon = column.icon;
          return (
            <div key={columnId} className="flex-1 min-w-[300px] flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${column.color} rounded-t-xl`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${column.textColor}`} />
                  <h3 className={`font-semibold ${column.textColor}`}>{column.title}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/50 dark:bg-black/20 ${column.textColor}`}>
                  {column.items.length}
                </span>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-4 space-y-3 overflow-y-auto transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-gray-700/50' : ''
                    }`}
                  >
                    {column.items.map((job, index) => (
                      <Draggable key={job._id} draggableId={job._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 rotate-2' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                #{job.order?._id.slice(-6)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(job.deadline).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {job.order?.customer ? `${job.order.customer.firstName} ${job.order.customer.lastName}` : 'Unknown Customer'}
                            </h4>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                              {job.details || 'No details provided'}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <User className="w-3 h-3 mr-1" />
                                {job.employee?.name || 'Unassigned'}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => onPrint(job)}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  title="Print Job Card"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                <Link 
                                  to={`/jobs/${job._id}/edit`}
                                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;

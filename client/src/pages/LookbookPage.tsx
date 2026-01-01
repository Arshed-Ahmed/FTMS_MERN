import { useState, useMemo } from 'react';
import { Filter, X, ZoomIn } from 'lucide-react';
import Layout from '../components/Layout';
import LayoutSkeleton from '../components/LayoutSkeleton';
import EmptyState from '../components/EmptyState';
import { useStyles, useItemTypes } from '../hooks/useQueries';

const LookbookPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState<any>(null);

  const { data: styles = [], isLoading: isLoadingStyles } = useStyles();
  const { data: itemTypes = [], isLoading: isLoadingItemTypes } = useItemTypes();

  const loading = isLoadingStyles || isLoadingItemTypes;

  const categories = useMemo(() => {
    const templateNames = itemTypes.map((t: any) => t.name);
    return ['All', ...templateNames];
  }, [itemTypes]);

  const filteredStyles = useMemo(() => {
    if (activeFilter === 'All') {
      return styles;
    } else {
      return styles.filter((style: any) => style.category === activeFilter);
    }
  }, [activeFilter, styles]);

  if (loading) return <LayoutSkeleton />;

  return (
    <Layout title="Style Lookbook">
      <div className="max-w-7xl mx-auto">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        {categories.map((category) => (
            <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === category
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg transform scale-105'
                : 'bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            >
            {category}
            </button>
        ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredStyles.map((style: any) => (
            <div 
              key={style._id} 
              className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedStyle(style)}
            >
              <div className="aspect-w-3 aspect-h-4 overflow-hidden">
                <img
                  src={style.image || 'https://via.placeholder.com/400x600?text=No+Image'}
                  alt={style.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{style.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{style.category}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredStyles.length === 0 && (
          <EmptyState
            title="No styles found"
            description={`We couldn't find any styles in the "${activeFilter}" category.`}
            icon={Filter}
          />
        )}

        {/* Modal */}
        {selectedStyle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm" onClick={() => setSelectedStyle(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
              <div className="md:w-1/2 h-96 md:h-auto relative">
                <img
                  src={selectedStyle.image || 'https://via.placeholder.com/400x600?text=No+Image'}
                  alt={selectedStyle.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedStyle.name}</h2>
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                    {selectedStyle.category}
                    </span>
                  </div>
                  <button onClick={() => setSelectedStyle(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Close">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="prose dark:prose-invert max-w-none flex-1 overflow-y-auto">
                    <p className="text-gray-600 dark:text-gray-300">
                    {selectedStyle.description || "No description available for this style."}
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    onClick={() => {
                        window.location.href = '/login';
                    }}
                  >
                    Login to Order This
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LookbookPage;
import React, { useState, useEffect } from 'react';
import { getServiceCategories, getServices, getServicesByCategory } from '../../api/ServicesApi';

function ExploreServices() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        limit: 9,
        total: 0
    });


    console.log({ selectedCategory });


    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getServiceCategories();
                setCategories(data.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch services when filters or page changes
    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);

            try {
                let servicesData = [];
                let totalItems = 0;

                if (selectedCategory) {
                    // 🔹 Fetch by category
                    const response = await getServicesByCategory(selectedCategory, {
                        page: pagination.currentPage,
                        limit: pagination.limit
                    });

                    servicesData = response.data || [];
                    totalItems = response.total || 0;

                } else {
                    // 🔹 Fetch all services
                    const data = await getServices({
                        page: pagination.currentPage,
                        limit: pagination.limit,
                        filter: searchQuery,
                    });

                    servicesData = data.data || data;
                    totalItems = data.pagination?.total || servicesData.length || 0;
                }

                const totalPages = Math.max(
                    1,
                    Math.ceil(totalItems / pagination.limit)
                );

                setServices(servicesData);

                setPagination(prev => ({
                    ...prev,
                    total: totalItems,
                    totalPages: totalPages
                }));

            } catch (error) {
                console.error('Error fetching services:', error);
                setServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [pagination.currentPage, searchQuery, selectedCategory]);



    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;

        setPagination(prev => ({ ...prev, currentPage: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    // Generate color for each service card
    const getServiceColor = (index) => {
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#6366f1'];
        return colors[index % colors.length];
    };

    // Generate pagination buttons
    const getPaginationButtons = () => {
        const buttons = [];
        const maxButtons = 5;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxButtons - 1);

        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(i);
        }
        return buttons;
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#fafafa',
            padding: '60px 20px'
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '56px', textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: '#0f172a',
                        letterSpacing: '-0.02em'
                    }}>
                        Our Services
                    </h1>
                    <p style={{
                        color: '#64748b',
                        fontSize: '16px',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Discover our comprehensive range of professional services tailored to meet your needs
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '48px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        position: 'relative',
                        flex: '1',
                        maxWidth: '400px',
                        minWidth: '250px'
                    }}>
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            style={{
                                width: '100%',
                                padding: '14px 40px 14px 18px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '15px',
                                outline: 'none',
                                backgroundColor: 'white',
                                transition: 'all 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            right: '18px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8',
                            fontSize: '18px'
                        }}>
                            🔍
                        </span>
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        style={{
                            padding: '14px 18px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '15px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            minWidth: '180px',
                            color: '#334155',
                            outline: 'none',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.CategoryID} value={category.CategoryID}>
                                {category.CategoryName}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleClearFilters}
                        style={{
                            padding: '14px 28px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '15px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            color: '#64748b',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                    >
                        Clear Filters
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                        <div style={{ fontSize: '18px' }}>Loading services...</div>
                    </div>
                )}

                {/* No Results */}
                {!loading && services.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>No services found</div>
                        <div style={{ fontSize: '14px' }}>Try adjusting your search or filters</div>
                    </div>
                )}

                {/* Services Grid */}
                {!loading && services.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '32px',
                        marginBottom: '64px'
                    }}>
                        {services.map((service, index) => (
                            <div
                                key={service.ServiceID}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    padding: '32px',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                    e.currentTarget.style.borderColor = '#f1f5f9';
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: `linear-gradient(135deg, ${getServiceColor(index)}15 0%, ${getServiceColor(index)}25 100%)`,
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={getServiceColor(index)}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                        <line x1="8" y1="21" x2="16" y2="21"></line>
                                        <line x1="12" y1="17" x2="12" y2="21"></line>
                                    </svg>
                                </div>

                                {/* Service Code */}
                                {service.ServiceCode && (
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#94a3b8',
                                        marginBottom: '8px',
                                        fontWeight: '500'
                                    }}>
                                        {service.ServiceCode}
                                    </div>
                                )}

                                {/* Title */}
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#0f172a',
                                    marginBottom: '10px',
                                    lineHeight: '1.3',
                                    letterSpacing: '-0.01em'
                                }}>
                                    {service.ServiceName}
                                </h3>

                                {/* Description */}
                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    marginBottom: '24px',
                                    lineHeight: '1.6',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {service.Description}
                                </p>

                                {/* Learn More Button */}
                                <button
                                    style={{
                                        padding: '0',
                                        backgroundColor: 'transparent',
                                        color: getServiceColor(index),
                                        border: 'none',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'gap 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.gap = '10px';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.gap = '6px';
                                    }}
                                >
                                    Learn More
                                    <span style={{ fontSize: '14px' }}>→</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && services.length > 0 && pagination.totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '48px'
                    }}>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            style={{
                                padding: '10px 18px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                backgroundColor: 'white',
                                cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                color: pagination.currentPage === 1 ? '#cbd5e1' : '#64748b',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                opacity: pagination.currentPage === 1 ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (pagination.currentPage !== 1) {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (pagination.currentPage !== 1) {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }
                            }}
                        >
                            ← Previous
                        </button>

                        {getPaginationButtons().map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    border: page === pagination.currentPage ? 'none' : '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    backgroundColor: page === pagination.currentPage ? '#3b82f6' : 'white',
                                    color: page === pagination.currentPage ? 'white' : '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: page === pagination.currentPage ? '600' : '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (page !== pagination.currentPage) {
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (page !== pagination.currentPage) {
                                        e.currentTarget.style.backgroundColor = 'white';
                                    }
                                }}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}

                            style={{
                                padding: '10px 18px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                backgroundColor: 'white',
                                cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                color: pagination.currentPage === pagination.totalPages ? '#cbd5e1' : '#64748b',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                opacity: pagination.currentPage === pagination.totalPages ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (pagination.currentPage !== pagination.totalPages) {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (pagination.currentPage !== pagination.totalPages) {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }
                            }}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExploreServices;
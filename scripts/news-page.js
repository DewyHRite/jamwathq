'use strict';

(function (window, document) {
    const updateFilterState = (isFiltering) => {
        const contentWrapper = document.querySelector('article.box.post');
        if (!contentWrapper) {
            return;
        }

        if (isFiltering) {
            contentWrapper.classList.add('filtering-active', 'content-wrapper');
        } else {
            contentWrapper.classList.remove('filtering-active', 'content-wrapper');
        }
    };

    const filterAgencyCards = () => {
        const searchInput = (document.getElementById('searchAgencyForm')?.value || '').toLowerCase();
        const locationFilter = (document.getElementById('locationForm')?.value || '').toLowerCase();
        const servicesFilter = (document.getElementById('servicesForm')?.value || '').toLowerCase();
        const agencies = document.querySelectorAll('.news-info');

        agencies.forEach((agency) => {
            const agencyName = agency.querySelector('header h3')?.textContent.toLowerCase() || '';
            const location = agency.querySelector('.location-tag')?.textContent.toLowerCase() || '';
            const servicesSection = Array.from(agency.querySelectorAll('section')).find((section) =>
                section.textContent.toLowerCase().includes('services:')
            );
            const servicesText = servicesSection?.textContent.toLowerCase() || '';

            const matchesSearch = !searchInput || agencyName.includes(searchInput);
            const matchesLocation = !locationFilter || location.includes(locationFilter);
            const matchesServices = !servicesFilter || servicesText.includes(servicesFilter);

            agency.style.display = matchesSearch && matchesLocation && matchesServices ? '' : 'none';
        });

        updateFilterState(Boolean(searchInput || locationFilter || servicesFilter));
    };

    const filterNewsEntries = () => {
        const titleInput = (document.getElementById('searchTitleForm')?.value || '').toLowerCase();
        const categoryFilter = (document.getElementById('categoryForm')?.value || '').toLowerCase();
        const yearFilter = (document.getElementById('yearForm')?.value || '').toLowerCase();
        const newsItems = document.querySelectorAll('.news-info');

        const isFiltering = Boolean(titleInput || categoryFilter || yearFilter);

        newsItems.forEach((news) => {
            const newsTitle = news.querySelector('header h3')?.textContent.toLowerCase() || '';
            const categorySection = Array.from(news.querySelectorAll('section')).find((section) =>
                section.textContent.toLowerCase().includes('category:')
            );
            const categoryText = categorySection?.textContent.toLowerCase() || '';

            const yearSection = Array.from(news.querySelectorAll('section')).find((section) =>
                section.textContent.toLowerCase().includes('year:')
            );
            const yearText = yearSection?.textContent.toLowerCase() || '';

            const matchesTitle = !titleInput || newsTitle.includes(titleInput);
            const matchesCategory = !categoryFilter || categoryText.includes(categoryFilter);
            const matchesYear = !yearFilter || yearText.includes(yearFilter);

            news.style.display = matchesTitle && matchesCategory && matchesYear ? '' : 'none';
        });

        updateFilterState(isFiltering);
    };

    window.filterAgencies = filterAgencyCards;
    window.filterNews = filterNewsEntries;
})(window, document);

// Bootstrap 5 IntelliSense Support for Template Toolkit
const vscode = require('vscode');

// Common Bootstrap 5 utility classes organized by category
const BOOTSTRAP_CLASSES = {
    // Layout
    grid: [
        'container', 'container-fluid', 'container-sm', 'container-md', 'container-lg', 'container-xl', 'container-xxl',
        'row', 'col', 'col-auto',
        'col-1', 'col-2', 'col-3', 'col-4', 'col-5', 'col-6', 'col-7', 'col-8', 'col-9', 'col-10', 'col-11', 'col-12',
        'col-sm', 'col-sm-auto', 'col-sm-1', 'col-sm-2', 'col-sm-3', 'col-sm-4', 'col-sm-5', 'col-sm-6', 'col-sm-7', 'col-sm-8', 'col-sm-9', 'col-sm-10', 'col-sm-11', 'col-sm-12',
        'col-md', 'col-md-auto', 'col-md-1', 'col-md-2', 'col-md-3', 'col-md-4', 'col-md-5', 'col-md-6', 'col-md-7', 'col-md-8', 'col-md-9', 'col-md-10', 'col-md-11', 'col-md-12',
        'col-lg', 'col-lg-auto', 'col-lg-1', 'col-lg-2', 'col-lg-3', 'col-lg-4', 'col-lg-5', 'col-lg-6', 'col-lg-7', 'col-lg-8', 'col-lg-9', 'col-lg-10', 'col-lg-11', 'col-lg-12',
        'col-xl', 'col-xl-auto', 'col-xl-1', 'col-xl-2', 'col-xl-3', 'col-xl-4', 'col-xl-5', 'col-xl-6', 'col-xl-7', 'col-xl-8', 'col-xl-9', 'col-xl-10', 'col-xl-11', 'col-xl-12',
        'col-xxl', 'col-xxl-auto', 'col-xxl-1', 'col-xxl-2', 'col-xxl-3', 'col-xxl-4', 'col-xxl-5', 'col-xxl-6', 'col-xxl-7', 'col-xxl-8', 'col-xxl-9', 'col-xxl-10', 'col-xxl-11', 'col-xxl-12',
        'offset-1', 'offset-2', 'offset-3', 'offset-4', 'offset-5', 'offset-6', 'offset-7', 'offset-8', 'offset-9', 'offset-10', 'offset-11',
        'offset-sm-0', 'offset-sm-1', 'offset-sm-2', 'offset-sm-3', 'offset-sm-4', 'offset-sm-5', 'offset-sm-6', 'offset-sm-7', 'offset-sm-8', 'offset-sm-9', 'offset-sm-10', 'offset-sm-11',
        'offset-md-0', 'offset-md-1', 'offset-md-2', 'offset-md-3', 'offset-md-4', 'offset-md-5', 'offset-md-6', 'offset-md-7', 'offset-md-8', 'offset-md-9', 'offset-md-10', 'offset-md-11',
        'offset-lg-0', 'offset-lg-1', 'offset-lg-2', 'offset-lg-3', 'offset-lg-4', 'offset-lg-5', 'offset-lg-6', 'offset-lg-7', 'offset-lg-8', 'offset-lg-9', 'offset-lg-10', 'offset-lg-11',
        'offset-xl-0', 'offset-xl-1', 'offset-xl-2', 'offset-xl-3', 'offset-xl-4', 'offset-xl-5', 'offset-xl-6', 'offset-xl-7', 'offset-xl-8', 'offset-xl-9', 'offset-xl-10', 'offset-xl-11',
        'g-0', 'g-1', 'g-2', 'g-3', 'g-4', 'g-5',
        'gx-0', 'gx-1', 'gx-2', 'gx-3', 'gx-4', 'gx-5',
        'gy-0', 'gy-1', 'gy-2', 'gy-3', 'gy-4', 'gy-5',
    ],
    // Display
    display: [
        'd-none', 'd-inline', 'd-inline-block', 'd-block', 'd-grid', 'd-inline-grid', 'd-table', 'd-table-row', 'd-table-cell', 'd-flex', 'd-inline-flex',
        'd-sm-none', 'd-sm-inline', 'd-sm-inline-block', 'd-sm-block', 'd-sm-grid', 'd-sm-inline-grid', 'd-sm-table', 'd-sm-table-row', 'd-sm-table-cell', 'd-sm-flex', 'd-sm-inline-flex',
        'd-md-none', 'd-md-inline', 'd-md-inline-block', 'd-md-block', 'd-md-grid', 'd-md-inline-grid', 'd-md-table', 'd-md-table-row', 'd-md-table-cell', 'd-md-flex', 'd-md-inline-flex',
        'd-lg-none', 'd-lg-inline', 'd-lg-inline-block', 'd-lg-block', 'd-lg-grid', 'd-lg-inline-grid', 'd-lg-table', 'd-lg-table-row', 'd-lg-table-cell', 'd-lg-flex', 'd-lg-inline-flex',
        'd-xl-none', 'd-xl-inline', 'd-xl-inline-block', 'd-xl-block', 'd-xl-grid', 'd-xl-inline-grid', 'd-xl-table', 'd-xl-table-row', 'd-xl-table-cell', 'd-xl-flex', 'd-xl-inline-flex',
        'd-xxl-none', 'd-xxl-inline', 'd-xxl-inline-block', 'd-xxl-block', 'd-xxl-grid', 'd-xxl-inline-grid', 'd-xxl-table', 'd-xxl-table-row', 'd-xxl-table-cell', 'd-xxl-flex', 'd-xxl-inline-flex',
        'd-print-none', 'd-print-inline', 'd-print-inline-block', 'd-print-block', 'd-print-grid', 'd-print-table', 'd-print-table-row', 'd-print-table-cell', 'd-print-flex', 'd-print-inline-flex',
    ],
    // Flexbox
    flex: [
        'flex-row', 'flex-column', 'flex-row-reverse', 'flex-column-reverse',
        'flex-sm-row', 'flex-sm-column', 'flex-sm-row-reverse', 'flex-sm-column-reverse',
        'flex-md-row', 'flex-md-column', 'flex-md-row-reverse', 'flex-md-column-reverse',
        'flex-lg-row', 'flex-lg-column', 'flex-lg-row-reverse', 'flex-lg-column-reverse',
        'flex-xl-row', 'flex-xl-column', 'flex-xl-row-reverse', 'flex-xl-column-reverse',
        'flex-xxl-row', 'flex-xxl-column', 'flex-xxl-row-reverse', 'flex-xxl-column-reverse',
        'justify-content-start', 'justify-content-end', 'justify-content-center', 'justify-content-between', 'justify-content-around', 'justify-content-evenly',
        'justify-content-sm-start', 'justify-content-sm-end', 'justify-content-sm-center', 'justify-content-sm-between', 'justify-content-sm-around', 'justify-content-sm-evenly',
        'justify-content-md-start', 'justify-content-md-end', 'justify-content-md-center', 'justify-content-md-between', 'justify-content-md-around', 'justify-content-md-evenly',
        'justify-content-lg-start', 'justify-content-lg-end', 'justify-content-lg-center', 'justify-content-lg-between', 'justify-content-lg-around', 'justify-content-lg-evenly',
        'justify-content-xl-start', 'justify-content-xl-end', 'justify-content-xl-center', 'justify-content-xl-between', 'justify-content-xl-around', 'justify-content-xl-evenly',
        'justify-content-xxl-start', 'justify-content-xxl-end', 'justify-content-xxl-center', 'justify-content-xxl-between', 'justify-content-xxl-around', 'justify-content-xxl-evenly',
        'align-items-start', 'align-items-end', 'align-items-center', 'align-items-baseline', 'align-items-stretch',
        'align-items-sm-start', 'align-items-sm-end', 'align-items-sm-center', 'align-items-sm-baseline', 'align-items-sm-stretch',
        'align-items-md-start', 'align-items-md-end', 'align-items-md-center', 'align-items-md-baseline', 'align-items-md-stretch',
        'align-items-lg-start', 'align-items-lg-end', 'align-items-lg-center', 'align-items-lg-baseline', 'align-items-lg-stretch',
        'align-items-xl-start', 'align-items-xl-end', 'align-items-xl-center', 'align-items-xl-baseline', 'align-items-xl-stretch',
        'align-items-xxl-start', 'align-items-xxl-end', 'align-items-xxl-center', 'align-items-xxl-baseline', 'align-items-xxl-stretch',
        'align-content-start', 'align-content-end', 'align-content-center', 'align-content-between', 'align-content-around', 'align-content-stretch',
        'align-content-sm-start', 'align-content-sm-end', 'align-content-sm-center', 'align-content-sm-between', 'align-content-sm-around', 'align-content-sm-stretch',
        'align-content-md-start', 'align-content-md-end', 'align-content-md-center', 'align-content-md-between', 'align-content-md-around', 'align-content-md-stretch',
        'align-content-lg-start', 'align-content-lg-end', 'align-content-lg-center', 'align-content-lg-between', 'align-content-lg-around', 'align-content-lg-stretch',
        'align-content-xl-start', 'align-content-xl-end', 'align-content-xl-center', 'align-content-xl-between', 'align-content-xl-around', 'align-content-xl-stretch',
        'align-content-xxl-start', 'align-content-xxl-end', 'align-content-xxl-center', 'align-content-xxl-between', 'align-content-xxl-around', 'align-content-xxl-stretch',
        'align-self-auto', 'align-self-start', 'align-self-end', 'align-self-center', 'align-self-baseline', 'align-self-stretch',
        'align-self-sm-auto', 'align-self-sm-start', 'align-self-sm-end', 'align-self-sm-center', 'align-self-sm-baseline', 'align-self-sm-stretch',
        'align-self-md-auto', 'align-self-md-start', 'align-self-md-end', 'align-self-md-center', 'align-self-md-baseline', 'align-self-md-stretch',
        'align-self-lg-auto', 'align-self-lg-start', 'align-self-lg-end', 'align-self-lg-center', 'align-self-lg-baseline', 'align-self-lg-stretch',
        'align-self-xl-auto', 'align-self-xl-start', 'align-self-xl-end', 'align-self-xl-center', 'align-self-xl-baseline', 'align-self-xl-stretch',
        'align-self-xxl-auto', 'align-self-xxl-start', 'align-self-xxl-end', 'align-self-xxl-center', 'align-self-xxl-baseline', 'align-self-xxl-stretch',
        'flex-fill', 'flex-sm-fill', 'flex-md-fill', 'flex-lg-fill', 'flex-xl-fill', 'flex-xxl-fill',
        'flex-grow-0', 'flex-grow-1', 'flex-sm-grow-0', 'flex-sm-grow-1', 'flex-md-grow-0', 'flex-md-grow-1', 'flex-lg-grow-0', 'flex-lg-grow-1', 'flex-xl-grow-0', 'flex-xl-grow-1', 'flex-xxl-grow-0', 'flex-xxl-grow-1',
        'flex-shrink-0', 'flex-shrink-1', 'flex-sm-shrink-0', 'flex-sm-shrink-1', 'flex-md-shrink-0', 'flex-md-shrink-1', 'flex-lg-shrink-0', 'flex-lg-shrink-1', 'flex-xl-shrink-0', 'flex-xl-shrink-1', 'flex-xxl-shrink-0', 'flex-xxl-shrink-1',
        'flex-wrap', 'flex-nowrap', 'flex-wrap-reverse',
        'flex-sm-wrap', 'flex-sm-nowrap', 'flex-sm-wrap-reverse',
        'flex-md-wrap', 'flex-md-nowrap', 'flex-md-wrap-reverse',
        'flex-lg-wrap', 'flex-lg-nowrap', 'flex-lg-wrap-reverse',
        'flex-xl-wrap', 'flex-xl-nowrap', 'flex-xl-wrap-reverse',
        'flex-xxl-wrap', 'flex-xxl-nowrap', 'flex-xxl-wrap-reverse',
        'gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5',
        'gap-sm-0', 'gap-sm-1', 'gap-sm-2', 'gap-sm-3', 'gap-sm-4', 'gap-sm-5',
        'gap-md-0', 'gap-md-1', 'gap-md-2', 'gap-md-3', 'gap-md-4', 'gap-md-5',
        'gap-lg-0', 'gap-lg-1', 'gap-lg-2', 'gap-lg-3', 'gap-lg-4', 'gap-lg-5',
        'gap-xl-0', 'gap-xl-1', 'gap-xl-2', 'gap-xl-3', 'gap-xl-4', 'gap-xl-5',
        'gap-xxl-0', 'gap-xxl-1', 'gap-xxl-2', 'gap-xxl-3', 'gap-xxl-4', 'gap-xxl-5',
        'order-first', 'order-0', 'order-1', 'order-2', 'order-3', 'order-4', 'order-5', 'order-last',
        'order-sm-first', 'order-sm-0', 'order-sm-1', 'order-sm-2', 'order-sm-3', 'order-sm-4', 'order-sm-5', 'order-sm-last',
        'order-md-first', 'order-md-0', 'order-md-1', 'order-md-2', 'order-md-3', 'order-md-4', 'order-md-5', 'order-md-last',
        'order-lg-first', 'order-lg-0', 'order-lg-1', 'order-lg-2', 'order-lg-3', 'order-lg-4', 'order-lg-5', 'order-lg-last',
        'order-xl-first', 'order-xl-0', 'order-xl-1', 'order-xl-2', 'order-xl-3', 'order-xl-4', 'order-xl-5', 'order-xl-last',
        'order-xxl-first', 'order-xxl-0', 'order-xxl-1', 'order-xxl-2', 'order-xxl-3', 'order-xxl-4', 'order-xxl-5', 'order-xxl-last',
    ],
    // Spacing
    spacing: [
        'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-auto',
        'mx-0', 'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-5', 'mx-auto',
        'my-0', 'my-1', 'my-2', 'my-3', 'my-4', 'my-5', 'my-auto',
        'mt-0', 'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mt-5', 'mt-auto',
        'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-auto',
        'ms-0', 'ms-1', 'ms-2', 'ms-3', 'ms-4', 'ms-5', 'ms-auto',
        'me-0', 'me-1', 'me-2', 'me-3', 'me-4', 'me-5', 'me-auto',
        'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5',
        'px-0', 'px-1', 'px-2', 'px-3', 'px-4', 'px-5',
        'py-0', 'py-1', 'py-2', 'py-3', 'py-4', 'py-5',
        'pt-0', 'pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5',
        'pb-0', 'pb-1', 'pb-2', 'pb-3', 'pb-4', 'pb-5',
        'ps-0', 'ps-1', 'ps-2', 'ps-3', 'ps-4', 'ps-5',
        'pe-0', 'pe-1', 'pe-2', 'pe-3', 'pe-4', 'pe-5',
    ],
    // Sizing
    sizing: [
        'w-25', 'w-50', 'w-75', 'w-100', 'w-auto', 'mw-100', 'vw-100', 'min-vw-100',
        'h-25', 'h-50', 'h-75', 'h-100', 'h-auto', 'mh-100', 'vh-100', 'min-vh-100',
    ],
    // Positioning
    position: [
        'position-static', 'position-relative', 'position-absolute', 'position-fixed', 'position-sticky',
        'top-0', 'top-50', 'top-100',
        'bottom-0', 'bottom-50', 'bottom-100',
        'start-0', 'start-50', 'start-100',
        'end-0', 'end-50', 'end-100',
        'translate-middle', 'translate-middle-x', 'translate-middle-y',
        'border', 'border-0', 'border-top', 'border-top-0', 'border-end', 'border-end-0', 'border-bottom', 'border-bottom-0', 'border-start', 'border-start-0',
        'border-primary', 'border-secondary', 'border-success', 'border-danger', 'border-warning', 'border-info', 'border-light', 'border-dark', 'border-white',
        'border-1', 'border-2', 'border-3', 'border-4', 'border-5',
        'rounded', 'rounded-0', 'rounded-1', 'rounded-2', 'rounded-3', 'rounded-4', 'rounded-5', 'rounded-circle', 'rounded-pill', 'rounded-top', 'rounded-end', 'rounded-bottom', 'rounded-start',
    ],
    // Colors
    colors: [
        'text-primary', 'text-secondary', 'text-success', 'text-danger', 'text-warning', 'text-info', 'text-light', 'text-dark', 'text-body', 'text-muted', 'text-white', 'text-black-50', 'text-white-50',
        'bg-primary', 'bg-secondary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'bg-light', 'bg-dark', 'bg-body', 'bg-white', 'bg-transparent', 'bg-black', 'text-bg-primary', 'text-bg-secondary', 'text-bg-success', 'text-bg-danger', 'text-bg-warning', 'text-bg-info', 'text-bg-light', 'text-bg-dark',
    ],
    // Typography
    typography: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'display-1', 'display-2', 'display-3', 'display-4', 'display-5', 'display-6',
        'lead',
        'small', 'mark', 'del', 'ins', 'u', 'strong', 'em',
        'text-start', 'text-center', 'text-end', 'text-justify', 'text-wrap', 'text-nowrap', 'text-truncate',
        'text-lowercase', 'text-uppercase', 'text-capitalize',
        'fs-1', 'fs-2', 'fs-3', 'fs-4', 'fs-5', 'fs-6',
        'fw-bold', 'fw-bolder', 'fw-semibold', 'fw-medium', 'fw-normal', 'fw-light', 'fw-lighter',
        'fst-italic', 'fst-normal',
        'lh-1', 'lh-sm', 'lh-base', 'lh-lg',
        'font-monospace',
        'text-decoration-none', 'text-decoration-underline', 'text-decoration-line-through',
        'text-break',
        'text-reset',
    ],
    // Visibility & Overflow
    visibility: [
        'visible', 'invisible',
        'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll',
        'overflow-x-auto', 'overflow-x-hidden', 'overflow-x-visible', 'overflow-x-scroll',
        'overflow-y-auto', 'overflow-y-hidden', 'overflow-y-visible', 'overflow-y-scroll',
    ],
    // Shadows
    shadows: [
        'shadow-none', 'shadow-sm', 'shadow', 'shadow-lg',
    ],
    // Opacity
    opacity: [
        'opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100',
    ],
    // Z-index
    zIndex: [
        'z-n1', 'z-0', 'z-1', 'z-2', 'z-3',
    ],
    // Focus ring
    focusRing: [
        'focus-ring',
        'focus-ring-primary', 'focus-ring-secondary', 'focus-ring-success', 'focus-ring-danger', 'focus-ring-warning', 'focus-ring-info', 'focus-ring-light', 'focus-ring-dark',
    ],
    // Icons (for Bootstrap Icons, often used alongside Bootstrap)
    icons: [
        'bi', 'bi-alarm', 'bi-archive', 'bi-arrow-down', 'bi-arrow-left', 'bi-arrow-right', 'bi-arrow-up',
        'bi-bell', 'bi-book', 'bi-bookmark', 'bi-bootstrap', 'bi-briefcase', 'bi-brightness-high', 'bi-calendar',
        'bi-camera', 'bi-cart', 'bi-chat', 'bi-check', 'bi-check-circle', 'bi-chevron-down', 'bi-chevron-left',
        'bi-chevron-right', 'bi-chevron-up', 'bi-circle', 'bi-clock', 'bi-cloud', 'bi-code', 'bi-cog', 'bi-collection',
        'bi-copy', 'bi-credit-card', 'bi-dash', 'bi-diagram', 'bi-download', 'bi-envelope', 'bi-eye', 'bi-eye-slash',
        'bi-file', 'bi-file-earmark', 'bi-filter', 'bi-flag', 'bi-folder', 'bi-gear', 'bi-geo-alt', 'bi-grid',
        'bi-hand-thumbs-down', 'bi-hand-thumbs-up', 'bi-heart', 'bi-house', 'bi-image', 'bi-inbox', 'bi-info-circle',
        'bi-journal', 'bi-key', 'bi-laptop', 'bi-layer', 'bi-layers', 'bi-lightbulb', 'bi-link', 'bi-list',
        'bi-lock', 'bi-map', 'bi-mic', 'bi-moon', 'bi-music', 'bi-paperclip', 'bi-pencil', 'bi-people',
        'bi-person', 'bi-phone', 'bi-play', 'bi-plus', 'bi-printer', 'bi-question-circle', 'bi-reply',
        'bi-save', 'bi-search', 'bi-share', 'bi-shield', 'bi-shield-check', 'bi-shop', 'bi-star', 'bi-sun',
        'bi-table', 'bi-tag', 'bi-tags', 'bi-telephone', 'bi-trash', 'bi-trophy', 'bi-upload', 'bi-wallet',
        'bi-x', 'bi-x-circle', 'bi-x-lg', 'bi-zoom-in', 'bi-zoom-out',
    ],
};

// Component classes
const BOOTSTRAP_COMPONENTS = {
    alerts: [
        'alert', 'alert-primary', 'alert-secondary', 'alert-success', 'alert-danger', 'alert-warning', 'alert-info', 'alert-light', 'alert-dark',
        'alert-heading', 'alert-link', 'alert-dismissible', 'fade', 'show', 'btn-close',
    ],
    badges: [
        'badge', 'text-bg-primary', 'text-bg-secondary', 'text-bg-success', 'text-bg-danger', 'text-bg-warning', 'text-bg-info', 'text-bg-light', 'text-bg-dark',
        'rounded-pill',
    ],
    breadcrumbs: [
        'breadcrumb', 'breadcrumb-item', 'active',
    ],
    buttons: [
        'btn', 'btn-primary', 'btn-secondary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info', 'btn-light', 'btn-dark',
        'btn-link', 'btn-outline-primary', 'btn-outline-secondary', 'btn-outline-success', 'btn-outline-danger',
        'btn-outline-warning', 'btn-outline-info', 'btn-outline-light', 'btn-outline-dark',
        'btn-lg', 'btn-sm', 'btn-block', 'disabled', 'active',
        'btn-group', 'btn-group-sm', 'btn-group-lg', 'btn-group-vertical', 'btn-toolbar',
        'dropdown-toggle', 'dropdown-toggle-split',
    ],
    cards: [
        'card', 'card-body', 'card-title', 'card-subtitle', 'card-text', 'card-link',
        'card-header', 'card-footer', 'card-img', 'card-img-top', 'card-img-bottom', 'card-img-overlay',
        'card-group', 'card-deck', 'card-columns',
        'list-group', 'list-group-flush', 'list-group-item',
    ],
    carousels: [
        'carousel', 'carousel-inner', 'carousel-item', 'active', 'carousel-caption',
        'carousel-control-prev', 'carousel-control-next', 'carousel-control-prev-icon', 'carousel-control-next-icon',
        'carousel-indicators', 'slide', 'carousel-fade', 'carousel-dark',
    ],
    dropdowns: [
        'dropdown', 'dropdown-menu', 'dropdown-menu-end', 'dropdown-toggle',
        'dropdown-item', 'active', 'disabled', 'dropdown-divider', 'dropdown-header',
        'dropdown-menu-dark', 'dropup', 'dropend', 'dropstart',
    ],
    forms: [
        'form-control', 'form-control-lg', 'form-control-sm', 'form-control-plaintext',
        'form-select', 'form-select-lg', 'form-select-sm',
        'form-check', 'form-check-input', 'form-check-label', 'form-check-inline',
        'form-switch', 'form-range',
        'input-group', 'input-group-text', 'input-group-lg', 'input-group-sm',
        'form-label', 'col-form-label', 'col-form-label-lg', 'col-form-label-sm',
        'form-text', 'invalid-feedback', 'valid-feedback', 'invalid-tooltip', 'valid-tooltip',
        'was-validated', 'needs-validation', 'is-valid', 'is-invalid',
        'form-floating',
        'form-control-color', 'form-control-file',
    ],
    lists: [
        'list-group', 'list-group-item', 'list-group-item-action', 'active', 'disabled',
        'list-group-flush', 'list-group-horizontal', 'list-group-numbered',
        'list-group-item-primary', 'list-group-item-secondary', 'list-group-item-success',
        'list-group-item-danger', 'list-group-item-warning', 'list-group-item-info',
        'list-group-item-light', 'list-group-item-dark',
    ],
    modals: [
        'modal', 'fade', 'modal-dialog', 'modal-dialog-centered', 'modal-dialog-scrollable',
        'modal-content', 'modal-header', 'modal-title', 'modal-body', 'modal-footer',
        'modal-static', 'modal-fullscreen', 'modal-fullscreen-sm-down', 'modal-fullscreen-md-down',
        'modal-fullscreen-lg-down', 'modal-fullscreen-xl-down', 'modal-fullscreen-xxl-down',
        'modal-lg', 'modal-sm', 'modal-xl',
        'show', 'modal-backdrop',
    ],
    navs: [
        'nav', 'nav-tabs', 'nav-pills', 'nav-fill', 'nav-justified',
        'nav-link', 'active', 'disabled', 'tab-content', 'tab-pane', 'fade', 'show', 'active',
        'navbar', 'navbar-expand', 'navbar-expand-sm', 'navbar-expand-md', 'navbar-expand-lg', 'navbar-expand-xl', 'navbar-expand-xxl',
        'navbar-nav', 'navbar-brand', 'navbar-text', 'collapse', 'navbar-collapse',
        'navbar-toggler', 'navbar-toggler-icon', 'show',
        'fixed-top', 'fixed-bottom', 'sticky-top', 'sticky-lg-top',
    ],
    pagination: [
        'pagination', 'pagination-lg', 'pagination-sm',
        'page-item', 'page-link', 'active', 'disabled',
    ],
    popovers: [
        'popover', 'popover-header', 'popover-body',
    ],
    progress: [
        'progress', 'progress-bar', 'progress-bar-striped', 'progress-bar-animated',
        'progress-stacked',
    ],
    spinners: [
        'spinner-border', 'spinner-border-sm', 'spinner-grow', 'spinner-grow-sm',
        'text-primary', 'text-secondary', 'text-success', 'text-danger', 'text-warning', 'text-info', 'text-light', 'text-dark',
    ],
    tables: [
        'table', 'table-striped', 'table-striped-columns', 'table-bordered', 'table-borderless',
        'table-hover', 'table-sm', 'table-responsive', 'table-responsive-sm', 'table-responsive-md',
        'table-responsive-lg', 'table-responsive-xl', 'table-responsive-xxl',
        'table-primary', 'table-secondary', 'table-success', 'table-danger', 'table-warning',
        'table-info', 'table-light', 'table-dark',
        'table-group-divider', 'caption-top',
        'thead-light', 'thead-dark',
    ],
    toasts: [
        'toast', 'toast-container', 'toast-header', 'toast-body',
        'showing', 'hide', 'show', 'fade',
    ],
    tooltips: [
        'tooltip', 'tooltip-inner', 'tooltip-arrow',
    ],
    offcanvas: [
        'offcanvas', 'offcanvas-start', 'offcanvas-end', 'offcanvas-top', 'offcanvas-bottom',
        'offcanvas-backdrop', 'offcanvas-header', 'offcanvas-title', 'offcanvas-body',
        'show',
    ],
    accordions: [
        'accordion', 'accordion-item', 'accordion-header', 'accordion-button',
        'accordion-collapse', 'collapse', 'show', 'accordion-body', 'accordion-flush',
        'collapsed',
    ],
    placeholders: [
        'placeholder', 'placeholder-xs', 'placeholder-sm', 'placeholder-lg',
        'placeholder-glow', 'placeholder-wave',
    ],
};

// Flatten all classes into a single array
function getAllBootstrapClasses() {
    const allClasses = new Set();

    Object.values(BOOTSTRAP_CLASSES).forEach(category => {
        category.forEach(cls => allClasses.add(cls));
    });

    Object.values(BOOTSTRAP_COMPONENTS).forEach(component => {
        component.forEach(cls => allClasses.add(cls));
    });

    return Array.from(allClasses).sort();
}

// Get description for a class
function getClassDescription(className) {
    const descriptions = {
        // Layout
        'container': 'Container with responsive max-width',
        'container-fluid': 'Full-width container',
        'row': 'Horizontal row for columns',
        'col': 'Flexible column',
        // Display
        'd-none': 'Hide element',
        'd-block': 'Display as block',
        'd-flex': 'Display as flexbox',
        'd-inline': 'Display as inline',
        'd-inline-block': 'Display as inline-block',
        'd-grid': 'Display as grid',
        // Flex utilities
        'justify-content-start': 'Justify content to start',
        'justify-content-center': 'Justify content to center',
        'justify-content-end': 'Justify content to end',
        'justify-content-between': 'Justify content with space between',
        'justify-content-around': 'Justify content with space around',
        'align-items-start': 'Align items to start',
        'align-items-center': 'Align items to center',
        'align-items-end': 'Align items to end',
        'flex-wrap': 'Allow flex items to wrap',
        'flex-nowrap': 'Prevent flex items from wrapping',
        'flex-column': 'Set flex direction to column',
        'flex-row': 'Set flex direction to row',
        // Spacing
        'm-0': 'Margin 0',
        'm-1': 'Margin 0.25rem',
        'm-2': 'Margin 0.5rem',
        'm-3': 'Margin 1rem',
        'm-4': 'Margin 1.5rem',
        'm-5': 'Margin 3rem',
        'p-0': 'Padding 0',
        'p-1': 'Padding 0.25rem',
        'p-2': 'Padding 0.5rem',
        'p-3': 'Padding 1rem',
        'p-4': 'Padding 1.5rem',
        'p-5': 'Padding 3rem',
        'mx-auto': 'Horizontal margin auto (center block)',
        // Sizing
        'w-100': 'Width 100%',
        'h-100': 'Height 100%',
        'w-50': 'Width 50%',
        'w-25': 'Width 25%',
        'w-75': 'Width 75%',
        // Colors
        'text-primary': 'Primary text color',
        'text-secondary': 'Secondary text color',
        'text-success': 'Success text color (green)',
        'text-danger': 'Danger text color (red)',
        'text-warning': 'Warning text color (yellow)',
        'text-info': 'Info text color (cyan)',
        'bg-primary': 'Primary background color',
        'bg-secondary': 'Secondary background color',
        'bg-success': 'Success background color',
        'bg-danger': 'Danger background color',
        'bg-light': 'Light background color',
        'bg-dark': 'Dark background color',
        'bg-white': 'White background',
        // Typography
        'h1': 'Heading 1 style',
        'h2': 'Heading 2 style',
        'h3': 'Heading 3 style',
        'display-1': 'Display heading 1 (largest)',
        'display-2': 'Display heading 2',
        'display-3': 'Display heading 3',
        'display-4': 'Display heading 4',
        'lead': 'Lead paragraph style',
        'text-center': 'Center-aligned text',
        'text-start': 'Left-aligned text (LTR)',
        'text-end': 'Right-aligned text (LTR)',
        'fw-bold': 'Bold font weight',
        'fw-normal': 'Normal font weight',
        'fst-italic': 'Italic font style',
        'text-uppercase': 'Uppercase text',
        'text-capitalize': 'Capitalized text',
        // Borders
        'border': 'Add border to all sides',
        'border-0': 'Remove border',
        'rounded': 'Rounded corners',
        'rounded-circle': 'Circular/fully rounded',
        'rounded-pill': 'Pill-shaped rounded corners',
        // Shadows
        'shadow': 'Box shadow',
        'shadow-sm': 'Small box shadow',
        'shadow-lg': 'Large box shadow',
        'shadow-none': 'No shadow',
        // Position
        'position-relative': 'Relative positioning',
        'position-absolute': 'Absolute positioning',
        'position-fixed': 'Fixed positioning',
        'position-sticky': 'Sticky positioning',
        // Components
        'btn': 'Base button class',
        'btn-primary': 'Primary button style',
        'btn-secondary': 'Secondary button style',
        'btn-success': 'Success button style',
        'btn-danger': 'Danger button style',
        'btn-lg': 'Large button',
        'btn-sm': 'Small button',
        'btn-block': 'Full-width button',
        'card': 'Card container',
        'card-body': 'Card body',
        'card-header': 'Card header',
        'card-footer': 'Card footer',
        'card-title': 'Card title',
        'alert': 'Alert container',
        'alert-primary': 'Primary alert',
        'alert-success': 'Success alert',
        'alert-danger': 'Danger alert',
        'alert-warning': 'Warning alert',
        'badge': 'Badge component',
        'modal': 'Modal container',
        'modal-dialog': 'Modal dialog',
        'modal-content': 'Modal content',
        'navbar': 'Navbar container',
        'navbar-expand-lg': 'Expand navbar at lg breakpoint',
        'nav': 'Navigation base class',
        'nav-tabs': 'Tab navigation',
        'nav-pills': 'Pill navigation',
        'dropdown': 'Dropdown container',
        'dropdown-menu': 'Dropdown menu',
        'dropdown-toggle': 'Dropdown toggle button',
        'dropdown-item': 'Dropdown item',
        'list-group': 'List group container',
        'list-group-item': 'List group item',
        'table': 'Table base class',
        'table-striped': 'Striped table rows',
        'table-bordered': 'Bordered table',
        'table-hover': 'Hover effect on rows',
        'form-control': 'Form input base class',
        'form-select': 'Select input base class',
        'form-check': 'Checkbox/radio wrapper',
        'input-group': 'Input group container',
        'input-group-text': 'Input group addon text',
        'spinner-border': 'Border spinner/loader',
        'spinner-grow': 'Growing spinner/loader',
        'toast': 'Toast notification',
        'accordion': 'Accordion container',
        'collapse': 'Collapsible content',
        'tooltip': 'Tooltip component',
        'popover': 'Popover component',
        'offcanvas': 'Offcanvas sidebar',
        'placeholder': 'Placeholder element',
        'carousel': 'Carousel/slider container',
        'pagination': 'Pagination container',
        'breadcrumb': 'Breadcrumb navigation',
        'progress': 'Progress bar container',
        'progress-bar': 'Progress bar',
        'spinner-border-sm': 'Small border spinner',
        'visually-hidden': 'Visually hidden (accessible)',
        'vr': 'Vertical rule/divider',
    };

    return descriptions[className] || `Bootstrap class: ${className}`;
}

// Create completion items from Bootstrap classes
function createBootstrapCompletionItems() {
    const allClasses = getAllBootstrapClasses();
    return allClasses.map(className => {
        const item = new vscode.CompletionItem(className, vscode.CompletionItemKind.Value);
        item.detail = 'Bootstrap 5';
        item.documentation = new vscode.MarkdownString(getClassDescription(className));
        item.insertText = className;
        return item;
    });
}

// Bootstrap IntelliSense Provider
class BootstrapCompletionProvider {
    constructor() {
        this.completionItems = createBootstrapCompletionItems();
    }

    provideCompletionItems(document, position) {
        const lineText = document.lineAt(position).text.substring(0, position.character);

        // Check if we're in a class attribute context
        const classAttrMatch = lineText.match(/class\s*=\s*["']([^"']*)$/);
        const classValueMatch = lineText.match(/class\s*=\s*["'][^"']*\s+$/);

        if (classAttrMatch || classValueMatch) {
            // We're inside a class attribute, provide Bootstrap class completions
            return this.completionItems;
        }

        // Check for TT class variable
        const ttClassMatch = lineText.match(/class\s*=>?\s*["']([^"']*)$/);
        if (ttClassMatch) {
            return this.completionItems;
        }

        return [];
    }
}

// Bootstrap Hover Provider
class BootstrapHoverProvider {
    provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_-]+/);
        if (!range) return;

        const word = document.getText(range);
        const allClasses = getAllBootstrapClasses();

        if (allClasses.includes(word)) {
            const description = getClassDescription(word);
            const contents = new vscode.MarkdownString();
            contents.appendCodeblock(word, 'html');
            contents.appendMarkdown(`**Bootstrap 5**\n\n${description}`);
            contents.isTrusted = true;
            return new vscode.Hover(contents, range);
        }
    }
}

module.exports = {
    BootstrapCompletionProvider,
    BootstrapHoverProvider,
    getAllBootstrapClasses,
    getClassDescription,
};

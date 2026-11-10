(() => {
  const BUTTON_ID = 'collapse-tests-button';
  const TEST_FILE_PATTERN = /(\.(test|spec)\.[cm]?[jt]sx?$)|(\/__tests__\/)/;
  const PULL_REQUEST_CHANGES_PATH = /^\/[^/]+\/[^/]+\/pull\/\d+\/(changes|files)/;
  const INVISIBLE_DIRECTION_MARKS = /[‎‏]/g;

  const isPullRequestChangesPage = () => PULL_REQUEST_CHANGES_PATH.test(location.pathname);

  const findSubmitReviewButton = () =>
    [...document.querySelectorAll('button[data-variant="primary"]')].find(
      (button) => button.textContent.trim().startsWith('Submit review') && !button.closest('dialog, [role="dialog"]'),
    );

  const getTooltipText = (button) => {
    const labelledById = button?.getAttribute('aria-labelledby');
    return button?.getAttribute('aria-label') ?? (labelledById && document.getElementById(labelledById)?.textContent) ?? '';
  };

  const getFilePath = (header) =>
    (header.querySelector('h3 code')?.textContent ?? '').replace(INVISIBLE_DIRECTION_MARKS, '').trim();

  const getCollapseToggle = (header) => header.querySelector('button');

  const isExpanded = (header) => getTooltipText(getCollapseToggle(header)).startsWith('Collapse');

  const getTestFileHeaders = () =>
    [...document.querySelectorAll('[data-diff-header-wrapper]')].filter((header) =>
      TEST_FILE_PATTERN.test(getFilePath(header)),
    );

  const toggleTestFiles = () => {
    const headers = getTestFileHeaders();
    const shouldCollapse = headers.some(isExpanded);
    headers
      .filter((header) => isExpanded(header) === shouldCollapse)
      .forEach((header) => getCollapseToggle(header).click());
    scheduleRefresh();
  };

  const createButton = (submitReviewButton) => {
    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.className = [...submitReviewButton.classList].filter((name) => name.startsWith('prc-')).join(' ');
    button.dataset.component = 'Button';
    button.dataset.size = submitReviewButton.dataset.size ?? 'small';
    button.dataset.variant = 'primary';
    button.style.marginInlineStart = getComputedStyle(submitReviewButton).marginInlineStart;

    const content = document.createElement('span');
    content.dataset.component = 'buttonContent';
    content.dataset.align = 'center';
    content.className = submitReviewButton.querySelector('[data-component="buttonContent"]')?.className ?? '';

    const label = document.createElement('span');
    label.dataset.component = 'text';
    label.className = submitReviewButton.querySelector('[data-component="text"]')?.className ?? '';

    content.append(label);
    button.append(content);
    button.addEventListener('click', toggleTestFiles);
    return button;
  };

  const updateButton = (button) => {
    const headers = getTestFileHeaders();
    const label = headers.some(isExpanded) ? `Collapse tests (${headers.length})` : `Expand tests (${headers.length})`;
    const labelElement = button.querySelector('[data-component="text"]');
    if (labelElement.textContent !== label) labelElement.textContent = label;
    button.hidden = headers.length === 0;
  };

  const refresh = () => {
    const existingButton = document.getElementById(BUTTON_ID);
    const submitReviewButton = isPullRequestChangesPage() && findSubmitReviewButton();

    if (!submitReviewButton) {
      existingButton?.remove();
      return;
    }

    const button = existingButton ?? createButton(submitReviewButton);
    if (button.nextElementSibling !== submitReviewButton) submitReviewButton.before(button);
    updateButton(button);
  };

  let refreshScheduled = false;
  const scheduleRefresh = () => {
    if (refreshScheduled) return;
    refreshScheduled = true;
    requestAnimationFrame(() => {
      refreshScheduled = false;
      refresh();
    });
  };

  new MutationObserver(scheduleRefresh).observe(document.body, { childList: true, subtree: true, characterData: true });
  scheduleRefresh();
})();

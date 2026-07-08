import { useEffect, useRef, useState } from 'react';

function NavMenuLinks({ links, onLinkClick }) {
	return links.map((link) => (
		<a
			key={link.href}
			role="menuitem"
			href={link.href}
			className="nav-menu-link"
			onClick={onLinkClick}
		>
			{link.label}
		</a>
	));
}

export default function SiteNav({ items }) {
	const [activeDropdown, setActiveDropdown] = useState(null);
	const navRef = useRef(null);

	useEffect(() => {
		function handleMouseDown(event) {
			if (!navRef.current?.contains(event.target)) {
				setActiveDropdown(null);
			}
		}

		function handleKeyDown(event) {
			if (event.key === 'Escape') {
				setActiveDropdown(null);
			}
		}

		document.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	function handleTriggerClick(name) {
		setActiveDropdown(activeDropdown === name ? null : name);
	}

	function closeDropdown() {
		setActiveDropdown(null);
	}

	return (
		<nav ref={navRef}>
			<div className="logo-wrap">
				<a href="/" className="logo-link" aria-label="Clockr home">
					<svg
						className="logo-home-icon"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M3 10.5 12 3l9 7.5" />
						<path d="M5 9.5V21h14V9.5" />
						<path d="M10 21v-7h4v7" />
					</svg>
					<span className="logo-main">Clock</span>
					<span className="logo-r">r</span>
				</a>
			</div>
			<ul className="nav-links">
				{items.map((item) => {
					if (item.href) {
						return (
							<li key={item.label}>
								<a href={item.href}>{item.label}</a>
							</li>
						);
					}

					const isOpen = activeDropdown === item.label;
					const menuClassName = [
						'nav-menu',
						item.wide ? 'nav-menu--wide' : '',
						item.alignRight ? 'nav-menu--right' : '',
					]
						.filter(Boolean)
						.join(' ');

					return (
						<li key={item.label} className="nav-dropdown">
							<button
								type="button"
								className="nav-dropdown-trigger"
								aria-expanded={isOpen}
								aria-haspopup="menu"
								onClick={() => handleTriggerClick(item.label)}
							>
								{item.label}
							</button>
							{isOpen && (
								<div
									className={menuClassName}
									role="menu"
									aria-label={item.label}
								>
									{item.sections
										? item.sections.map((section) => (
												<div
													key={section.label}
													className="nav-menu-section"
												>
													<div
														className="nav-menu-section-label"
														role="presentation"
													>
														{section.label}
													</div>
													<NavMenuLinks
														links={section.links}
														onLinkClick={closeDropdown}
													/>
												</div>
											))
										: (
											<NavMenuLinks
												links={item.links}
												onLinkClick={closeDropdown}
											/>
										)}
								</div>
							)}
						</li>
					);
				})}
			</ul>
			<a href="/create-countdown" className="nav-cta">
				Create Countdown
			</a>
		</nav>
	);
}

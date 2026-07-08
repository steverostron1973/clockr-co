import { useEffect, useRef, useState } from 'react';

export default function SiteNav({ dropdowns, links = [] }) {
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

	return (
		<nav ref={navRef}>
			<div className="logo-wrap">
				<a href="/">
					<span className="logo-main">Clock</span>
					<span className="logo-r">r</span>
				</a>
			</div>
			<ul className="nav-links">
				{dropdowns.map((dropdown) => {
					const isOpen = activeDropdown === dropdown.label;
					const menuClassName = [
						'nav-menu',
						dropdown.wide ? 'nav-menu--wide' : '',
						dropdown.alignRight ? 'nav-menu--right' : '',
					]
						.filter(Boolean)
						.join(' ');

					return (
						<li key={dropdown.label} className="nav-dropdown">
							<button
								type="button"
								className="nav-dropdown-trigger"
								aria-expanded={isOpen}
								aria-haspopup="menu"
								onClick={() => handleTriggerClick(dropdown.label)}
							>
								{dropdown.label}
							</button>
							{isOpen && (
								<div
									className={menuClassName}
									role="menu"
									aria-label={dropdown.label}
								>
									{dropdown.links.map((link) => (
										<a
											key={link.href}
											role="menuitem"
											href={link.href}
											className="nav-menu-link"
											onClick={() => setActiveDropdown(null)}
										>
											{link.label}
										</a>
									))}
								</div>
							)}
						</li>
					);
				})}
				{links.map((link) => (
					<li key={link.href}>
						<a href={link.href}>{link.label}</a>
					</li>
				))}
			</ul>
			<a href="/create-countdown" className="nav-cta">
				Create Countdown
			</a>
		</nav>
	);
}

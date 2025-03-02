import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join, relative, resolve } from "path";
import { Application, ParameterType, Renderer, RendererEvent } from "typedoc";

declare module "typedoc" {
	interface TypeDocOptionMap {
		redirects: Record<string, string>;
	}
}

const PLUGIN_PREFIX = "[typedoc-plugin-redirect]";

const PAGE_TEMPLATE = `<!DOCTYPE html>
<html>
	<head>
		<title>{MOVED}</title>
		<meta charset="utf-8" />
		<meta http-equiv="refresh" content="0;URL='{URL}'" />
	</head>
	<body>
		<p>{MOVED_URL}</p>
	</body>
</html>
`;

export function load(app: Application) {
	app.options.addDeclaration({
		name: "redirects",
		help: "Define redirects to write to the generated output directory.",
		defaultValue: {},
		configFileOnly: true,
		type: ParameterType.Mixed,
		validate(value) {
			if (!value || typeof value !== "object") {
				throw new Error(
					"The \"redirects\" option must be set to an object with string values.",
				);
			}

			for (const val of Object.values(value)) {
				if (typeof val !== "string") {
					throw new Error(
						"The \"redirects\" option must be set to an object with string values.",
					);
				}
			}
		},
	});

	app.renderer.on(Renderer.EVENT_END, (event: RendererEvent) => {
		const redirects = app.options.getValue("redirects");
		for (const [fromPath, toPath] of Object.entries(redirects)) {
			let outputPath = join(event.outputDirectory, fromPath);
			if (outputPath.endsWith("/")) {
				outputPath += "index.html";
			}
			if (existsSync(outputPath)) {
				app.logger.warn(
					`${PLUGIN_PREFIX} ${outputPath} will be overwritten with a redirect.`,
				);
			}

			mkdirSync(dirname(outputPath), { recursive: true });
			writeFileSync(
				outputPath,
				buildOutputFile(event.outputDirectory, outputPath, toPath),
			);
		}
	});
}

function buildOutputFile(
	outDir: string,
	outputPath: string,
	targetPath: string,
) {
	let target: string;
	if (["/", "http://", "https://"].some((p) => targetPath.startsWith(p))) {
		target = escapeHtml(targetPath);
	} else {
		target = escapeHtml(
			relative(dirname(outputPath), resolve(outDir, targetPath)),
		);
	}

	const replacements = {
		MOVED: `This page has moved to ${target}`,
		MOVED_URL: `This page has moved to <a href="${target}">${target}</a>.`,
		URL: target,
	};

	return PAGE_TEMPLATE.replace(
		/{(MOVED|MOVED_URL|URL)}/g,
		(_, k) => replacements[k as never],
	);
}

const htmlEscapes: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;",
};

function escapeHtml(html: string) {
	return html.replace(/[&<>'"]/g, (c) => htmlEscapes[c as never]);
}

import { GraphQLScalarType, Kind } from 'graphql';

export const FileScalar = new GraphQLScalarType({
	name: 'File',
	description: 'File upload scalar type',
	parseValue: (value) => value,
	serialize: (value) => value,
	parseLiteral: (ast) => {
		if (ast.kind === Kind.STRING) {
			return ast.value;
		}
		return null;
	}
});

/* eslint-disable-next-line @typescript-eslint/no-unsafe-function-type */
export const FileScalarType = FileScalar as unknown as Function &
	GraphQLScalarType;

export interface FileUpload {
	blobParts: Buffer[];
	type: string;
	encoding: string;
	_size: number | null;
	_buffer: Buffer | null;
	_text: string | null;
	name: string;
	lastModified: number;
	webkitRelativePath: string;
}

export class CreateSnippetDto {
  code: string;
  id?: string; // Optional: ID of the snippet being edited
  projectId?: string;
  name?: string;
}

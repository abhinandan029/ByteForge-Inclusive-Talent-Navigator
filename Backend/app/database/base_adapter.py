
class CursorAdapter:
    """Wrap a database cursor and translate SQL placeholders."""

    def __init__(self, cursor, placeholder):
        self._cursor = cursor
        self._placeholder = placeholder

    def execute(self, query, params=None):
        if self._placeholder != "?":
            query = query.replace("?", self._placeholder)

        if params is None:
            return self._cursor.execute(query)

        return self._cursor.execute(query, params)

    def __getattr__(self, name):
        return getattr(self._cursor, name)


class ConnectionAdapter:
    """Wrap a connection and return compatible cursor adapters."""

    def __init__(self, connection, placeholder):
        self._connection = connection
        self._placeholder = placeholder

    def cursor(self, *args, **kwargs):
        cursor = self._connection.cursor(*args, **kwargs)

        return CursorAdapter(
            cursor,
            self._placeholder
        )

    def commit(self):
        return self._connection.commit()

    def rollback(self):
        return self._connection.rollback()

    def close(self):
        return self._connection.close()

    def __getattr__(self, name):
        return getattr(self._connection, name)

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.executeQuery = void 0;

/** execute query and return result */
const executeQuery = async (src, queryText, params, log) => {
  const start = Date.now();
  return src.query(queryText, params).finally(() => {
    const duration = Date.now() - start;

    if (log) {
      log({
        queryText,
        params,
        duration
      });
    }
  });
};

exports.executeQuery = executeQuery;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9leGVjdXRlLXF1ZXJ5LnRzIl0sIm5hbWVzIjpbImV4ZWN1dGVRdWVyeSIsInNyYyIsInF1ZXJ5VGV4dCIsInBhcmFtcyIsImxvZyIsInN0YXJ0IiwiRGF0ZSIsIm5vdyIsInF1ZXJ5IiwiZmluYWxseSIsImR1cmF0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBR0E7QUFDTyxNQUFNQSxZQUFZLEdBQUcsT0FDMUJDLEdBRDBCLEVBRTFCQyxTQUYwQixFQUcxQkMsTUFIMEIsRUFJMUJDLEdBSjBCLEtBS0U7QUFDNUIsUUFBTUMsS0FBSyxHQUFHQyxJQUFJLENBQUNDLEdBQUwsRUFBZDtBQUNBLFNBQU9OLEdBQUcsQ0FBQ08sS0FBSixDQUFhTixTQUFiLEVBQXdCQyxNQUF4QixFQUFnQ00sT0FBaEMsQ0FBd0MsTUFBTTtBQUNuRCxVQUFNQyxRQUFRLEdBQUdKLElBQUksQ0FBQ0MsR0FBTCxLQUFhRixLQUE5Qjs7QUFDQSxRQUFJRCxHQUFKLEVBQVM7QUFDUEEsTUFBQUEsR0FBRyxDQUFDO0FBQUNGLFFBQUFBLFNBQUQ7QUFBWUMsUUFBQUEsTUFBWjtBQUFvQk8sUUFBQUE7QUFBcEIsT0FBRCxDQUFIO0FBQ0Q7QUFDRixHQUxNLENBQVA7QUFNRCxDQWJNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUge1Bvb2wsIFBvb2xDbGllbnQsIFF1ZXJ5UmVzdWx0fSBmcm9tICdwZyc7XG5pbXBvcnQgdHlwZSB7TG9nZ2VyfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKiogZXhlY3V0ZSBxdWVyeSBhbmQgcmV0dXJuIHJlc3VsdCAqL1xuZXhwb3J0IGNvbnN0IGV4ZWN1dGVRdWVyeSA9IGFzeW5jIDxUPihcbiAgc3JjOiBQb29sIHwgUG9vbENsaWVudCxcbiAgcXVlcnlUZXh0OiBzdHJpbmcsXG4gIHBhcmFtcz86IHVua25vd25bXSxcbiAgbG9nPzogTG9nZ2VyLFxuKTogUHJvbWlzZTxRdWVyeVJlc3VsdDxUPj4gPT4ge1xuICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XG4gIHJldHVybiBzcmMucXVlcnk8VD4ocXVlcnlUZXh0LCBwYXJhbXMpLmZpbmFsbHkoKCkgPT4ge1xuICAgIGNvbnN0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIHN0YXJ0O1xuICAgIGlmIChsb2cpIHtcbiAgICAgIGxvZyh7cXVlcnlUZXh0LCBwYXJhbXMsIGR1cmF0aW9ufSk7XG4gICAgfVxuICB9KTtcbn07XG4iXX0=
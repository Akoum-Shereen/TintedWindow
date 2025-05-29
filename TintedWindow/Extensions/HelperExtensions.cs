using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Routing;

namespace TintedWindow.Extensions
{
    public static class HelperExtensions
    {
        public static string GetRequiredString(this RouteData routeData, string keyName)
        {
            object value;
            if (!routeData.Values.TryGetValue(keyName, out value))
            {
                throw new InvalidOperationException($"Could not find key with name '{keyName}'");
            }

            return value?.ToString();
        }
        public static string GetDescription<T>(this T e) where T : IConvertible
        {
            if (e is Enum)
            {
                System.Type type = e.GetType();
                Array values = System.Enum.GetValues(type);

                foreach (int val in values)
                {
                    if (val == e.ToInt32(CultureInfo.InvariantCulture))
                    {
                        var memInfo = type.GetMember(type.GetEnumName(val));
                        var descriptionAttribute = memInfo[0]
                            .GetCustomAttributes(typeof(DescriptionAttribute), false)
                            .FirstOrDefault() as DescriptionAttribute;

                        if (descriptionAttribute != null)
                        {
                            return descriptionAttribute.Description;
                        }
                    }
                }
            }

            return null;
        }
        public static Dictionary<string, bool> CheckSectionPermissions(List<string> actions)
        {
            var permissions = new Dictionary<string, bool>();

            foreach (Common.Action action in Enum.GetValues(typeof(Common.Action)))
            {
                var actionName = action.ToString().Replace(" ", string.Empty);
                var permissionKey = $"can{actionName}";

                permissions[permissionKey] = actions.Any(x => x.Equals(actionName, StringComparison.OrdinalIgnoreCase));
            }

            return permissions;
        }
        public static string GetEnumStringValue(Enum enumValue)
        {
            return enumValue.ToString().Replace(" ", string.Empty).ToLower();
        }
        public static bool CheckEnumValuesInCollection<T>(IEnumerable<T> collection, T enumValue1, T enumValue2)
    where T : Enum
        {
            string enumValue1String = GetEnumStringValue(enumValue1);
            string enumValue2String = GetEnumStringValue(enumValue2);

            return collection.Any(a => GetEnumStringValue(a) == enumValue1String || GetEnumStringValue(a) == enumValue2String);
        }
    }
}
